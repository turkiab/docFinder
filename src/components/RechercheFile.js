import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';

export default class RechercheFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      path: '',
      textMessage: '',
      words: ['9 octobre'],
      names: [],
      deletedTags: [],
      selected: []
    };
  }

  handleUpload = (event) => {
    const files = Array.prototype.slice.call(event.target.files);
    this.setState({
      files,
    });
  };

  checkIfStringContainsAllElementsInArray = (string, array) => {
    if (array.length > 0) {
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
          this.setState((prevState) => ({
            names: [...prevState.names, file]
          }), () => {
            resolve();
          });
        } else {
          resolve();
        }
      };
      reader.onerror = (e) => {
        console.error("Error reading file:", e.target.error);
        reject(e.target.error);
      };
      reader.readAsText(file);
    });
  };

  showFile = async () => {
    this.setState({ names: [], selected: [] }, async () => {
      const promises = this.state.files.map((file) => this.checkFiles(file));
      try {
        await Promise.all(promises);
        console.log(this.state.names);
      } catch (error) {
        console.error("Error processing files:", error);
      }
    });
  };

  addTags = (event) => {
    const tagUpper = event.target.value.trim();
    if (event.key === 'Enter' && tagUpper) {
      this.setState((prevState) => ({
        words: [...prevState.words, tagUpper]
      }));
      event.target.value = '';
    }
  };

  removeTag = (index) => {
    const deletedTag = this.state.words[index];
    if (deletedTag._id !== null || deletedTag._id !== undefined) {
      this.setState((prevState) => ({
        deletedTags: [...prevState.deletedTags, deletedTag]
      }));
    }
    this.setState((prevState) => ({
      words: prevState.words.filter((_, i) => i !== index)
    }));
  };

  tagsMapRender = () => {
    return this.state.words.map((tag, index) => (
      <li key={index} className="tag">
        <span>{tag}</span>
        <i className="tagi" onClick={() => {
          this.removeTag(index);
        }}>x</i>
      </li>
    ));
  };

  preview = (file) => {
    this.setState((prevState) => ({
        selected: [...prevState.selected, file.name]
        }), () => {
        console.log(this.state.selected);
        });
        console.log(file);
        window.open(URL.createObjectURL(file), '_blank');
        const blob = new Blob([file], {type: 'application/xml'});
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = file.name + '.pdf';
        link.click();
  };

  downloadFile = (file) => {
    const fileUrl = URL.createObjectURL(file);

    // Create a hidden anchor element
    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    downloadLink.href = fileUrl;
    downloadLink.target = '_blank';
    downloadLink.download = file.name; // Set the download attribute to the file name

    // Append the anchor element to the document body
    document.body.appendChild(downloadLink);

    // Trigger a click event on the anchor element to prompt the download dialog
    downloadLink.click();

    // Remove the anchor element from the document body
    document.body.removeChild(downloadLink);
  };

  documentList = () => {
    return this.state.names.map((file, index) =>
      <p key={index} className={this.state.selected.includes(file.name) ? 'fileTextSelected' : 'fileText'} onClick={() => this.preview(file)}>
        {file.name} {this.state.selected.includes(file.name) && <span className='myButton' onClick={() => this.downloadFile(file)}>Download</span>}
      </p>
    );
  };

  render() {
    return (
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="container">
          <div className="row">
            <input
              placeholder="press enter to add tags"
              type="text"
              className="inputtags"
              onKeyUp={this.addTags}
            />
            <div className="tags-input">
              <ul id="tags">
                {this.tagsMapRender()}
              </ul>
            </div>
            <form>
              <h3>Chose your files</h3>
              <div className="form-group">
                <input
                  type="file"
                  multiple
                  accept=".xml"
                  name="files"
                  onChange={this.handleUpload}
                />
              </div>
              <input type='button' value='upload' onClick={this.showFile} />
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
    );
  }
}
