import * as React from "react";
import { HashRouter, Route, Routes } from "react-router-dom"; // Changed to HashRouter
import { SPComponentLoader } from "@microsoft/sp-loader";
import GetJsonFromSP from "./CustomFormBuilder/GetJsonFromSP";
import CreateForm from "./CustomFormBuilder/CreateForm";
import ConfigureWorkflow from "./CustomFormBuilder/ConfigureWorkflow";
import InProcess from "./CustomFormBuilder/InProcessView";
import ViewForm from "./CustomFormBuilder/ViewForm";
import Draft from "./CustomFormBuilder/Draft";
import EditTransactionForm from "./CustomFormBuilder/EditTransactionForm";
import { IDynamicFormBuilderProps } from "./IDynamicFormBuilderProps";
// import Person from "./CustomFormBuilder/PeoplePickerComponent";
import RejectedForm from "./CustomFormBuilder/RejectedForm";
import RejectedView from "./CustomFormBuilder/RejectedView";
import MappingMasterComponent from "./CustomFormBuilder/MappingMasterComponent";
import FormDashBoard from "./CustomFormBuilder/FormDashBoard/FormDashBoard";


export default class DynamicFormBuilder extends React.Component<IDynamicFormBuilderProps, { showFormBuilder: boolean }> {
  constructor(props: IDynamicFormBuilderProps) {
    super(props);
    this.state = {
      showFormBuilder: false,
    };
  }

  componentDidMount() {
    SPComponentLoader.loadCss("https://use.fontawesome.com/releases/v5.13.0/css/all.css");
    SPComponentLoader.loadCss("https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css");

    const element = document.querySelector('.j_b_8474018e') as HTMLElement;
    if (element) {
      element.style.maxWidth = '100%';
    }
  }

  public render(): React.ReactElement<IDynamicFormBuilderProps> {
    return (
      <div>
        <HashRouter>
          <div className="Dashboard">
            <Routes>
            {/* <Route path="/Peoplepicker" element={< Person context={this.props.context}/> } /> */}

              <Route path="/" element={<GetJsonFromSP context={this.props.context} />} />
              <Route path="/CreateForm" element={<CreateForm context={this.props.context} />} />
              <Route path="/ConfigureWorkflow" element={<ConfigureWorkflow context={this.props.context} />} />
              <Route path="/InProcess" element={<InProcess />} />
              <Route path="/viewform/:id" element={<ViewForm />} />
              <Route path="/RejectedView" element={<RejectedView/>}/>
              <Route path="/RejectedForm/:id" element={<RejectedForm/>}/> 
              <Route path="/Draft" element={<Draft />} />
              <Route path="/EditForm/:id" element={<EditTransactionForm />} />
              <Route path="/mapping-master/:appCode" element={<MappingMasterComponent />} />
              <Route path="/FormDashBoard" element={<FormDashBoard/>}/>
              <Route path="*" element={<GetJsonFromSP context={this.props.context} />} />
              
            </Routes>
          </div>
        </HashRouter>
      </div>
    );
  }
}



