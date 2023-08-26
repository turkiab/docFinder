import React, { Component } from 'react';
import logo from '../logo.svg';
import '../AppAi.css';

const apiKey = "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";

class RechercheFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      path: '',
      textMessage: '',
      words: [],
      names: [],
      deletedTags: [],
      selected: [],
      showPopup: false,
      showHiddenContent : false,
      loading : true,
      fileSummarize : ''
    };
  }

    componentDidMount() {
        window.addEventListener('mousedown', this.pageClick, false);
    }


    /**
     * If we click on the modaloverlay we fadeout the modal
     * @param {*} e
     */
    pageClick = (e) => {
        if (this.state.showHiddenContent && e.target.id === 'listener')
           this.setState({showHiddenContent : false,fileSummarize: ''})
    }
    
    

  handleUpload = (event) => {
    const files = Array.from(event.target.files);
    this.setState({ files });
  };

  checkIfStringContainsAllElementsInArray = (string, array) => {
    return array.every(element => string.includes(element));
  };

  checkFiles = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        const text = e.target.result;
        const flag = this.checkIfStringContainsAllElementsInArray(text, this.state.words);
        if (flag) {
          resolve(file);
        } else {
          resolve(null);
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
    const results = await Promise.all(this.state.files.map(file => this.checkFiles(file)));
    const filteredNames = results.filter(Boolean);
    this.setState({ names: filteredNames, selected: [], showPopup: true });

    // Set a timeout to hide the popup after 4 seconds
    setTimeout(() => {
      this.setState({ showPopup: false });
    }, 8000);
  };

  addTags = (event) => {
    if (event.key === 'Enter') {
      const tagUpper = event.target.value.trim();
      if (tagUpper) {
        this.setState((prevState) => ({
          words: [...prevState.words, tagUpper]
        }));
        event.target.value = '';
      }
    }
  };

  removeTag = (index) => {
    const deletedTag = this.state.words[index];
    if (deletedTag) {
      this.setState((prevState) => ({
        deletedTags: [...prevState.deletedTags, deletedTag]
      }));
    }
    this.setState((prevState) => ({
      words: prevState.words.filter((_, i) => i !== index)
    }));
  };


  preview = (file) => {
    this.setState((prevState) => ({
    selected: [...prevState.selected, file.name]
    }), () => {
    console.log(this.state.selected);
    });
    window.open(URL.createObjectURL(file), '_blank');
};

// Modify the preview function to accept a callback function

checkAi = async (file) => {
    // Read the file's content
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target.result;

      // Create the API request body
      const apiBody = {
        "model": "gpt-3.5-turbo",
        "messages": [
          {
            "role": "system",
            "content": "fais moi un résumé en une seule paragraphe très courte, maximum 5 lignes à ce texte : "
          },
          {
            "role": "user",
            "content": fileContent // Pass the file's content here
          }
        ],
        "temperature": 0,
        "max_tokens": 6000
      };

      // Send the request to the OpenAI API
      await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(apiBody)
      })
        .then((data) => data.json())
        .then((data) => {
          console.log(data);
          this.setState({
            fileSummarize: data?.choices[0]?.message?.content
          });
          // Set loading to false when you have the summary
          this.setState({ loading: false });
        })
        .catch((error) => {
          console.error("Error calling OpenAI API:", error);
          // Set loading to false in case of an error
          this.setState({ loading: false });
        });
    };

    // Read the file as text
    reader.readAsText(file);
}
resume = (file) => {
    this.setState(
      (prevState) => ({
        selected: [...prevState.selected, file.name],
        showHiddenContent: true, // Show the hidden content when previewing
        loading: true, // Set loading to true when starting the preview
      }),
      () => {
        console.log(this.state.showHiddenContent); // Log the updated state here
        setTimeout(() => {
            this.checkAi(file);
        }, 2000);
        // You can call other functions here if needed
      }
    );
  };
  
  
  // Modify the render function to call preview with a callback
  renderDocumentTableRow = (file, index) => {
    const isSelected = this.state.selected.includes(file.name);
    return (
      <tr key={index}>
        <td
          className={isSelected ? 'fileTextSelected' : 'fileText'}
          onClick={() => this.preview(file)}
        >
          {file.name}
        </td>
        <td>
            <span className="custom-file-upload" onClick={() => this.downloadFile(file)}>
              Download
            </span>
        </td>
        <td>
            <span className="custom-file-upload" onClick={() => this.resume(file)}>
              Summarize
            </span>
        </td>
      </tr>
    );
  };
  
  

  downloadFile = (file) => {
    const fileUrl = URL.createObjectURL(file);

    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    downloadLink.href = fileUrl;
    downloadLink.target = '_blank';
    downloadLink.download = file.name;
    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);
  };

  renderDocumentTable = () => {
    return (
      <table className="document-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {this.state.names.map(this.renderDocumentTableRow)}
        </tbody>
      </table>
    );
  };

  checkCard = () => {
        return (
            <div id='listener' className={this.state.showHiddenContent ? 'overviewCard' : 'overviewCardHide' }>
            <div className='card'>
                {
                  !this.state.loading ? (<p>{this.state.fileSummarize}</p>) : (<div className='spinner'></div>)  
                }
            </div>
        </div>
        )
  }
  render() {
    const popupClassName = this.state.names.length > 0 ? 'popup' : 'popup red-popup';
    return (
      <>
        {
            this.checkCard()
        }
      <div className="facebook-design">
        <div className="facebook-header">
          <img src={logo} className="facebook-logo" alt="logo" />
        </div>
        <div className="facebook-container">
          <div className="facebook-row">
            <input
              placeholder="press enter to add tags"
              type="text"
              className="inputtags"
              onKeyUp={this.addTags}
            />
            <div className="tags-input">
              <ul id="tags">{this.state.words.map((tag, index) => (
                <li key={index} className="tag">
                  <span>{tag}</span>
                  <i className="tagi" onClick={() => this.removeTag(index)}>x</i>
                </li>
              ))}</ul>
            </div>
            <div className="fancy-form">
              <h3 className="fancy-heading">Choose your files</h3>
              <div className="form-group">
                <label htmlFor="file-upload" className="custom-file-upload">
                  <i className="fas fa-cloud-upload-alt"></i> Select Files (
                  {this.state.files.length})
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".xml"
                  name="files"
                  onChange={this.handleUpload}
                />
              </div>
              <button className="fancy-upload-button" onClick={this.showFile}>
                Upload
              </button>
              {this.state.showPopup && (
                <div className={popupClassName}>
                  <span>
                    {this.state.names.length > 0
                      ? `${this.state.names.length} files found`
                      : 'No files found'}
                  </span>
                  <span
                    className="close-button"
                    onClick={() => this.setState({ showPopup: false })}
                  >
                    &#x2715;
                  </span>
                </div>
              )}
            </div>
            <div className="facebook-document-list">
              {this.state.names.length > 0
                ? this.renderDocumentTable()
                : <p>No Files</p>}
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }
}

export default RechercheFile;
