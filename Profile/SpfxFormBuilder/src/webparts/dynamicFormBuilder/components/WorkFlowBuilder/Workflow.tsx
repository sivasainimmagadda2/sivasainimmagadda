import * as React from "react";
import "react-form-builder2/dist/app.css";
import type { IDynamicFormBuilderProps } from '../IDynamicFormBuilderProps';
import { SPComponentLoader } from "@microsoft/sp-loader";
import {  sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
 
export interface IWorkflowState {
    messagesFromIframe: any[], // Array of any objects, no specific structure
    // postingbool:boolean,
    // title:string
}
export interface IFrameMessage {
  type: string;
  payload: object;
  posting: boolean;
  title:string
}
 
 
export default class Workflow extends React.Component<IDynamicFormBuilderProps,IWorkflowState> {
  constructor(props: IDynamicFormBuilderProps) {
    super(props);
    this.state = {
     
      messagesFromIframe: [],
    //   postingbool:false,
    //   title:""
    };
  }
 
  componentDidMount() {
    SPComponentLoader.loadCss(
      "https://use.fontawesome.com/releases/v5.13.0/css/all.css"
    );
    SPComponentLoader.loadCss(
      "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
    );
    window.addEventListener('message', this.handleIframeMessage);
    sp.setup({
      spfxContext: this.props.context as any
    });
  }
  componentWillUnmount() {
   
    window.removeEventListener('message', this.handleIframeMessage);
  }
 
//   componentDidUpdate(prevProps: IDynamicFormBuilderProps, prevState: IWorkflowState) {
//     // Check if postingbool has changed and is true
//     if (this.state.postingbool && prevState.postingbool !== this.state.postingbool) {
//       // Create the list item when postingbool becomes true
//       this.createListItem(this.state.messagesFromIframe,this.state.title);
//     }
//   }
  handleIframeMessage = (event: MessageEvent):void => {
    // Check if the event is coming from the expected iframe and type
    if (event.data.type === 'FROM_IFRAME') {
      const jsonData:IFrameMessage[] = event.data.payload;
     
      this.setState({
        messagesFromIframe:  jsonData, // Append new message to state array
       
      }, () => {
        console.log('Updated state:', this.state); // Debug log
    });
    }
  };
 
 
 
 
  public render(): React.ReactElement<IDynamicFormBuilderProps> {
 
 
    return (
      <section>
       
        <div 
        >
            <iframe
                src="http://localhost:3001/"
                style={{ border: "none", display: "block", width: "1000px", height: "100vh" }}
                title="Embedded Application">
            </iframe>
        
        </div>
       
      </section>
    );
  }
}