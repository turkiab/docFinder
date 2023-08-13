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
            deletedTags: [],
            selected : []
        };
    }

    componentDidMount() {

    }
  
  componentDidUpdate() {

  }

  handleUpload = (event) => {
    const files = Array.prototype.slice.call(event.target.files);
    this.setState({
      files,
    });
  };

  checkIfStringContainsAllElementsInArray = (string, array) => {
    if(array.length > 0) {
      for (const element of array) {
        if (!string.includes(element)) {
          return false;
        }
      } 
    }
    return true;
  };

  checkFiles = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const flag = this.checkIfStringContainsAllElementsInArray(
          text,
          this.state.words
        );
        if (flag) {
          this.setState(
            (prevState) => ({ names: [...prevState.names, file] }),
            () => {
              resolve(); // Resolve the promise when state update is done
            }
          );
        } else {
          resolve(); // Resolve even if not added to names array
        }
      };
      reader.readAsText(file);
    });
  };

  showFile = async () => {
    this.setState({ names: [], selected: [] }, async () => {
      const promises = this.state.files.map((file) => this.checkFiles(file));
      await Promise.all(promises);
      console.log(this.state.names); // Names will contain files that match criteria
    });
  };


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

preview = (file) => {
  this.setState(
    (prevState) => ({ selected: [...prevState.selected, file.name] }),
    () => {
      console.log(this.state.selected)
    }
  );
  window.open(URL.createObjectURL(file), '_blank');
}






documentList = () => {
  return this.state.names.map((file, index) => 
  <p key={index} className={ this.state.selected.includes(file.name) ? 'fileTextSelected' : 'fileText'} onClick={() => this.preview(file)}>{file.name}</p>)
}

  render() {
    return (
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="container">
                <div className="row">
                    <input placeholder="press enter to add tags" type="text"
                                className="inputtags" onKeyUp={this.addTags}/>
                    <div className="tags-input">
                        <ul id="tags">
                            {this.tagsMapRender()}
                        </ul>
                    </div>
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
                                this.state.names && this.state.names.length > 0 ? 
                                this.documentList() : (<p>No Files</p>)
                            }
                    </div> 
                </div>
          </div>
      </div>
    )
  }
}
