module.exports = function (App) {
  const { KLNode } = require('@kumologica/devkit');
  const Mustache = require('mustache');
  
  class GraphqlclientError extends Error {
    constructor(error) {
      super(error);
      this.name = 'Graphql client Failed';
      this.message = error.message;
      this.statusCode = '500';
      this.originalError = error;
    }
  }
  class Graphqlclientnode extends KLNode {
    constructor(props) {
      super(App, props);
      this.name = props.name;
      this.template = props.template;
      this.url = props.url;
      this.token = props.token || ""
    }
    async handle(msg) {
      const Template = App.util.evaluateDynamicField(this.template, msg, this);
      const Token = App.util.evaluateDynamicField(this.token, msg, this);
      const Url = App.util.evaluateDynamicField(
        this.url,
        msg,
        this
      );
      const Twilioauthtoken = App.util.evaluateDynamicField(this.twilioauthtoken, msg, this);
      try {
       // let inputtemplate = {"content" : Template } ;
      //  console.log('inputtemplate-->'+ JSON.stringify(inputtemplate));
        const output = await Mustache.render(`{"query": ${JSON.stringify(Template)}}`, msg);
        let headers = {};
        if(msg.graphql == undefined || msg.graphql == {}){
          headers =  {
            'Content-Type' : 'application/json',
            'Authorization' : Token
          }
        }else{
          headers = msg.graphql.headers;
        }
        const options = {
          headers: headers,
          url: `${Url}`,
          method: 'POST',
          body: output
        }
       //  console.log(options)
         let response = await this.http(options).json();
         msg.payload = await response;
         this.send(msg);
      } catch (error) {
        console.log(error)
        this.sendError(new GraphqlclientError(error), msg);
      }
    }
  }
  App.nodes.registerType('Graphql', Graphqlclientnode);
};
