const React = require('react')
const ReactDOM = require('react-dom')
const request = require('axios')

const url = 'http://localhost:3000/messages'
const fD = ReactDOM.findDOMNode

class MessageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectLanguage: 'RUS', 
    };  
    this.chengeSelect = this.chengeSelect.bind(this);  
}
chengeSelect(event){
  this.setState({selectLanguage: event.target.value});
}
  render() {
    const{selectLanguage}=this.state;
    var messages = this.props.messages
    if (!messages || !messages.length>0) return (
        <p>No records yet</p>
    )
    return (
      <table className="table ">
        <caption>Voices</caption>
        <thead>
          <tr>
            <th className="span2">Language</th>
            <th className="span2">ProviderLanguage</th>  
            <th className="span2">Name</th> 
            <th className="span2">Id</th>        
            <th className="span2">Gender</th>
            <th className="span2">Provider</th>
          </tr>
          
        </thead>
        <tbody>
          <tr>
            <td className="span2">
              <select value={selectLanguage} onChange={this.chengeSelect} style={{width:100}}>
                {messages.map(function (message, index) {
                  return <option  key={index}>{message.language}</option>
                })}
              </select>
            </td>
            <td className="span2">              
            </td>
            <td className="span2">              
            </td>
            <td className="span2">              
            </td>
            <td className="span2">             
            </td>
            <td className="span2">             
            </td>
          </tr>
          
          {
            messages.filter(item => item.language == selectLanguage).map(message => {
              return (
                <tr key={message._id}>
                  <td className="span2">{message.language}</td>
                  <td className="span2">{message.providerLanguage}</td>
                  <td className="span2">{message.name}</td>
                  <td className="span2">{message.id}</td>
                  <td className="span2">{message.sex}</td>
                  <td className="span2">{message.provider}</td>

                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }
}

class NewMessage extends React.Component {
  constructor(props) {
    super(props)
    this.addMessage = this.addMessage.bind(this)
    this.keyup = this.keyup.bind(this)
  }
  addMessage() {
    let language = fD(this.refs.language).value.trim()
    let providerLanguage = fD(this.refs.providerLanguage).value.trim()
    let name = fD(this.refs.name).value.trim()
    let id = fD(this.refs.id).value.trim()
    let sex = fD(this.refs.sex).value.trim()
    let provider = fD(this.refs.provider).value.trim()
    if (!language || !providerLanguage) {
      return console.error('language and providerLanguage cannot be empty')
    }
    this.props.addMessageCb({
      language: language,
      providerLanguage: providerLanguage,
      name: name,
      id: id,
      provider: provider,
      sex: sex
    })
    fD(this.refs.language).value = ''
    fD(this.refs.providerLanguage).value = ''
    fD(this.refs.name).value = ''
    fD(this.refs.id).value = ''
    fD(this.refs.provider).value = ''
    fD(this.refs.sex).value = ''
  }
  keyup(e) {
    if (e.keyCode == 13) return this.addMessage()
  }
  render() {
    return (
      <div className="row-fluid" id="new-message">
        <div className="span12">
          <form className="well form-inline" onKeyUp={this.keyup} onSubmit={this.addMessage}>
            <input
              type="text" name="username"
              className="input-small" placeholder="language" ref="language"/>
            <input
              type="text" name="message" className="input-medium"
              placeholder="providerLanguage" ref="providerLanguage" />
              <input
              type="text" name="name" className="input-small"
              placeholder="name" ref="name" />
              <input
              type="text" name="id" className="input-small"
              placeholder="id" ref="id" />
              <input
              type="text" name="sex" className="input-small"
              placeholder="gender" ref="sex" />
              <input
              type="text" name="provider" className="input-small"
              placeholder="provider" ref="provider" />
            <a id="send" className="btn btn-primary"
              onClick={this.addMessage}>ADD</a>
          </form>
        </div>
      </div>
    )
  }
}

class MessageBoard extends React.Component {
  constructor(ops) {
    super(ops)
    this.addMessage = this.addMessage.bind(this)
    if (this.props.messages)
      this.state = {messages: this.props.messages}
  }
  componentDidMount() {
    request.get(url)
      .then(response => response.data)
      .then(messages => {
        console.log(messages)
        if(!messages || !messages.length){
          return;
        }
        console.log(messages)
        this.setState({messages: messages})
      })
  }
  addMessage(message) {
    let messages = this.state.messages
    request.post(url, message)
      .then(result => result.data)
      .then((data) =>{
        if(!data){
          return console.error('Failed to save')
        }
        console.log('Saved!')
        messages.unshift(data)
        this.setState({messages: messages})
    })
  }
  render() {
    return (
      <div>
        <NewMessage messages={this.state.messages} addMessageCb={this.addMessage} />
        <MessageList messages={this.state.messages} />
      </div>
    )
  }
}

module.exports = MessageBoard