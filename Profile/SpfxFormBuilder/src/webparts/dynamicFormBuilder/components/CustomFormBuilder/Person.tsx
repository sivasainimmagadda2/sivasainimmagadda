// import * as React from "react";
// import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
// import { GlobalContextProvider } from "../../GlobalContext";
// import { IAppProps } from "../IAppProps";
// interface IAppStates {
//   user: {} | null;
//   allPeople: any[];
// }

// class Person extends React.Component<IAppProps, IAppStates> {
//   constructor(props: IAppProps) {
//     super(props);
//     this.state = {
//       user: null,
//       allPeople: [],
//     };

//     this.handleSubmit = this.handleSubmit.bind(this);
//   }

//   onchangeLegalContact(item: any) {
//     debugger;
//     console.log("Selected People:", item);
//     this.setState({ allPeople: item });
//     // this.props.navigate("/personDetail", { state: { item } });
//   }

//   async handleSubmit() {
//     console.log("Submitting:", this.state.allPeople);
//     let EmailOne = "";
//     let NameOne = "";

//     for (let i = 0; i < this.state.allPeople.length; i++) {
//       EmailOne += this.state.allPeople[i].secondaryText + " ; ";
//     }
//     for (let i = 0; i < this.state.allPeople.length; i++) {
//       NameOne += this.state.allPeople[i].text + " ; ";
//     }
//     console.log("Emails:", EmailOne, "Names:", NameOne);
//   }

//   public render(): React.ReactElement {
//     return (
//       <>
//         <GlobalContextProvider value={{ spfxContext: this.props.context }}>
//           <PeoplePicker
//             context={this.props.context}
//             personSelectionLimit={1}
//             groupName={""}
//             required={true}
//             onChange={(e) => this.onchangeLegalContact(e)}
//             showHiddenInUI={false}
//             principalTypes={[PrincipalType.User]}
//             resolveDelay={1000}
//             placeholder="Search..."
//           />
//         </GlobalContextProvider>

//         {/* <button onClick={this.handleSubmit}>Submit</button> */}
//       </>
//     );
//   }
// }

// export default Person;
