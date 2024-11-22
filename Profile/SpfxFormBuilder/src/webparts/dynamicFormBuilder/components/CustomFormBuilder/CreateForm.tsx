import * as React from "react";
import "react-form-builder2/dist/app.css";
import type { IDynamicFormBuilderProps } from '../IDynamicFormBuilderProps';
import { SPComponentLoader } from "@microsoft/sp-loader";
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import Sidebar from "./SideNavBar";
import TopNavBar from "./TopBar";

export interface ICreateFormState {
  messagesFromIframe: any[];
  postingbool: boolean;
  title: string;
  formType: string;
  formTypeOptions: string[]; // New state variable for options
}

export interface IFrameMessage {
  type: string;
  payload: object;
  posting: boolean;
  title: string;
}

export default class CreateForm extends React.Component<IDynamicFormBuilderProps, ICreateFormState> {
  constructor(props: IDynamicFormBuilderProps) {
    super(props);
    this.state = {
      messagesFromIframe: [],
      postingbool: false,
      title: "",
      formType: "IT", // Default form type
      formTypeOptions: [] // Initialize as an empty array
    };
  }

  async componentDidMount() {
    SPComponentLoader.loadCss("https://use.fontawesome.com/releases/v5.13.0/css/all.css");
    SPComponentLoader.loadCss("https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css");
    window.addEventListener('message', this.handleIframeMessage);
    sp.setup({ spfxContext: this.props.context as any });

    // Fetch form type options from the FormType list
    try {
      const items = await sp.web.lists.getByTitle("FormType").items.select("Title").get();
      const options = items.map(item => item.Title);
      this.setState({ formTypeOptions: options });
    } catch (error) {
      this.handleError(error, "Error fetching form type options");
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleIframeMessage);
  }

  componentDidUpdate(prevProps: IDynamicFormBuilderProps, prevState: ICreateFormState) {
    try {
      if (this.state.postingbool && prevState.postingbool !== this.state.postingbool) {
        if (this.state.title && this.state.title.trim() !== "") {
          void this.createListItem(this.state.messagesFromIframe, this.state.title);
        } else {
          alert("Title should not be empty");
        }
      }
    } catch (error) {
      this.handleError(error, "Error in componentDidUpdate");
    }
  }

  handleIframeMessage = (event: MessageEvent): void => {
    try {
      if (event.data.type === 'FROM_IFRAME') {
        const jsonData: IFrameMessage[] = event.data.payload;
        this.setState({
          messagesFromIframe: jsonData,
          postingbool: event.data.posting,
          title: event.data.title
        }, () => {
          console.log('Updated state:', this.state);
        });
      } else {
        throw new Error("Invalid message type or payload");
      }
    } catch (error) {
      this.handleError(error, "Error processing iframe message");
    }
  };

  private generateUniqueAppCode(appName: string): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const namePrefix = appName.slice(0, 3).toUpperCase().padEnd(3, 'X');

    const combinedString = randomDigits + randomLetters;
    const shuffledString = combinedString.split('').sort(() => Math.random() - 0.5).join('');

    return `${namePrefix}-${shuffledString}`;
  }

  private async createListItem(data: any, appName: string): Promise<void> {
    try {
      const appCode = this.generateUniqueAppCode(appName);
      if (this.state.formType === "") {
        alert("Please Select Form Type");
      } else {
        const item = await sp.web.lists.getByTitle("FormMaster").items.add({
          AppName: appName,
          AppCode: appCode,
          FormJSON: JSON.stringify(data),
          FormType: this.state.formType
        });
        console.log("Item created:", item);
        alert("Item created successfully!");
      }
    } catch (error) {
      this.handleError(error, "Error creating list item");
    }
  }

  private handleError(error: unknown, context: string): void {
    if (error instanceof Error) {
      console.error(`${context}:`, error);
      alert(`${context}: ${error.message}`);
    } else {
      console.error(`${context}: An unknown error occurred`);
      alert(`${context}: An unknown error occurred`);
    }
  }

  public render(): React.ReactElement<IDynamicFormBuilderProps> {
    try {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TopNavBar />
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <section style={{ width: '100%' }}>
              <div>
                <label htmlFor="formTypeDropdown">Select Form Type:</label>
                <select
                  id="formTypeDropdown"
                  value={this.state.formType}
                  onChange={(e) => this.setState({ formType: e.target.value })}
                  style={{ marginBottom: '10px' }}
                >
                  <option value="">Select</option>
                  {this.state.formTypeOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
                <iframe
                  src="https://smartofficenxt-reactformbuilder-dev.s3.us-east-1.amazonaws.com/index.html"
                  title="Embedded Application"
                  style={{ border: "none", display: "block", width: "100%", height: "100vh" }}
                />
              </div>
            </section>
          </div>
        </div>
      );
    } catch (error) {
      this.handleError(error, "Error rendering component");
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TopNavBar />
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div>Error rendering component.</div>
          </div>
        </div>
      );
    }
  }
}
