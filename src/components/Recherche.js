import React, { Component } from 'react'
import logo from '../logo.svg';
import '../App.css';
import axios from "axios";

export default class recherche extends Component {

    constructor(props) {
        super(props);
        this.state = {
            files : [],
            path : '',
            textMessage : '',
            words : ['9 octobre'],
            names : [],
            deletedTags: []
        };
    }

    componentDidMount() {

    }
  
  componentDidUpdate() {

  }

  search = () => {
    const url = 'http://localhost:8080/api/';
    const url2 = 'https://doc-gre-backend-b3e988357648.herokuapp.com/api/';
    axios.post(url,{ path : this.state.path}).then((result) => {
        if(result?.data) {
            if(typeof result?.data === 'string' || result?.data instanceof String) {
                this.setState({textMessage : result?.data})
            } else {
                if(result?.data.length > 0) {
                    console.log(result?.data);
                    this.setState({files : result?.data});
                }
            }
        }
      });
  }

  onChangeText = (e) => {
    this.setState({path : e.target.value});
  }

  onClickTextFile = (e) => {
    window.open(`file:///${e.target?.innerHTML}`,"_blank");

  }

  handleUpload = (event) => {
    console.log(event.target.files[0])
    const files = Array.prototype.slice.call(event.target.files);
    this.setState({
      files,
    },() => {
      console.log(this.state.files);
    });
  };

  checkIfStringContainsAllElementsInArray = (string, array) => {
    for (const element of array) {
      if (!string.includes(element)) {
        return false;
      }
    }
    return true;
  };

  showFile = async () => {
    this.setState({names : []}, () => {
      this.state.files.map((file,index) => {
        // e.preventDefault()
        console.log(file.fullPath);
        const reader = new FileReader()
        reader.onload = async (e) => { 
          const text = (e.target.result)
          const flag = this.checkIfStringContainsAllElementsInArray(text, this.state.words);
          if(flag) {
            this.setState({ names: [...this.state.names, file.name] },() => {
              console.log(this.state.names)
            })
          }
        };
        reader.readAsText(file)
      })
    });
  }

  addTags = (event) => {
    const tagUpper = event.target.value;
    if (event.key === 'Enter') {
        this.setState({
            words: [...this.state.words, tagUpper]
        });
        event.target.value = '';
    }
};

removeTag = (index) => {
  var deletedTagArray = [...this.state.deletedTags];
  var array = [...this.state.words];
  const deletedTag = this.state.words[index];
  if (deletedTag._id !== null || deletedTag._id !== undefined) {
      deletedTagArray.push(deletedTag);
      this.setState({deletedTags: deletedTagArray});
  }
  if (index !== -1) {
      array.splice(index, 1);
      this.setState({words: array});
  }
}

tagsMapRender = () => {
  return this.state.words.map((tag, index) => (
      <li key={index} className="tag">
          <span>{tag}</span>
          <i className="tagi" onClick={() => {
              this.removeTag(index);
          }}>x</i>
      </li>));
}

  render() {
    return (
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="container">
                <div className="row">
                <label htmlFor="tags" className="form-label">Words</label>
                    <div className="tags-input">
                        <ul id="tags">
                            {this.tagsMapRender()}
                        </ul>
                    </div>
                    <input placeholder="press enter to add tags" type="text"
                                onKeyUp={this.addTags}/>
                    <form>
                        <h3>Chose your files</h3>
                        <div className="form-group">
                            <input type="file" 
                                    multiple  
                                    accept=".xml"
                                    name="files"
                                    onChange={this.handleUpload}
                                    />
                        </div>
                        <input type='button' value='upload' onClick={this.showFile}/>
                    </form>
                    <div>
                            {   
                                this.state.names.length ? this.state.names.map((name, index) => 
                                <p key={index} className='fileText' >{name}</p>) : 
                                <p>{this.state.textMessage}</p>
                            }
                    </div> 
                </div>
          </div>
      </div>
    )
  }
}
