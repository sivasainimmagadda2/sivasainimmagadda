import * as React from 'react';
import { useState } from 'react';
import { sp } from "@pnp/sp/presets/all";
import { ReactFormGenerator } from 'react-form-builder2';
import './GetData.css';

interface IFormComponentProps {
  selectedFormJSON: any[];
  selectedFormTitle: string;
  selectedFormAppCode: string;
  goBack: () => void;
}

const FormComponent: React.FC<IFormComponentProps> = ({ selectedFormJSON, selectedFormTitle, selectedFormAppCode, goBack }) => {
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateRandomString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      setError(`Error: ${error.message}`);
    } else {
      console.error("Unexpected error", error);
      setError("An unexpected error occurred.");
    }
  };

  const getRoutingRules = async (appCode: string, buttonAction: string) => {
    return await sp.web.lists.getByTitle("RoutingRules").items.filter(`(AppCode eq '${appCode}') and (Actions eq '${buttonAction}')`).get();
  };

  const getCurrentUserSeqNo = async () => {
    const currentUser = await sp.web.currentUser.get();
    const displayNamePrefix = currentUser.Title.substring(0, 6).toUpperCase();
    const randomString = generateRandomString(6);
    return `${displayNamePrefix}-${randomString}`;
  };

  const handleSubmit = async (data: any) => {
    const buttonAction = "Submit";
    const formDataString = JSON.stringify(data);
    const appName = selectedFormTitle || "";
    const appCode = selectedFormAppCode || "";
    const formPrefix = appName.split(' ').map(word => word.charAt(0).toUpperCase()).join('') + "/";

    try {
      const routingRulesItems = await getRoutingRules(appCode, buttonAction);
      if (routingRulesItems.length === 0) {
        setError("Reviewers or Approvers are not available for further actions");
        return;
      }

      const { CurrentQueue, DestinationQueue, Status } = routingRulesItems[0];
      const mappingMasterItem = await sp.web.lists.getByTitle("MappingMaster").items
        .select("*", "Users_x002f_Groups/Id", "Users_x002f_Groups/Title")
        .expand("Users_x002f_Groups")
        .filter(`(Level eq '${DestinationQueue}') and (AppCode eq '${appCode}')`)
        .get();

      const userGroupId = mappingMasterItem[0].Users_x002f_Groups.Id;

      const latestItem = await sp.web.lists.getByTitle("WorkFlowProcessData").items
        .filter(`substringof('${formPrefix}', Title)`)
        .orderBy("ID", false)
        .top(1)();

      const latestNumber = latestItem.length > 0 ? parseInt(latestItem[0].Title.split('/')[2]) || 0 : 0;
      const newTitle = `${formPrefix}2024-2025/${latestNumber + 1}`;

      const seqNo = await getCurrentUserSeqNo();

      await sp.web.lists.getByTitle("WorkFlowProcessData").items.add({
        Title: newTitle,
        FormData: formDataString,
        AppName: appName,
        AppCode: appCode,
        Status: Status,
        CurApproverId: userGroupId,
        CurrentQueue: CurrentQueue,
        DestinationQueue: DestinationQueue,
        Level: mappingMasterItem[0].Level,
        SeqNo: seqNo,
      });

      alert("Data has been submitted!");
      setFormData(null); // Reset form data after submission
      goBack();
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const handleSave = async (data: any) => {
    const formDataString = JSON.stringify(data);
    const appName = selectedFormTitle || "";
    const appCode = selectedFormAppCode || "";
    const formPrefix = appName.split(' ').map(word => word.charAt(0).toUpperCase()).join('');

    try {
      const buttonAction = "Save";
      const routingRulesItems = await getRoutingRules(appCode, buttonAction);
      if (routingRulesItems.length === 0) {
        setError("No routing rules found for saving.");
        return;
      }

      const { CurrentQueue, DestinationQueue, Status } = routingRulesItems[0];
      const seqNo = await getCurrentUserSeqNo();
      const newTitle = `${formPrefix}/Draft`;

      await sp.web.lists.getByTitle("WorkFlowProcessData").items.add({
        Title: newTitle,
        FormData: formDataString,
        AppName: appName,
        AppCode: appCode,
        Status: Status,
        CurApproverId: null,
        CurrentQueue: CurrentQueue,
        DestinationQueue: DestinationQueue,
        Level: DestinationQueue,
        SeqNo: seqNo,
      });

      alert("Data successfully saved as draft!");
      setFormData(null); // Reset form data after saving
      goBack();
    } catch (error: unknown) {
      handleError(error);
    }
  };

  return (
    <>
      <div>
        <h3>{selectedFormTitle}</h3>
        {error && <div style={{ color: "red", margin: "10px" }}>{error}</div>}
        <ReactFormGenerator
          data={selectedFormJSON}
          form_action="/submit"
          form_method="POST"
          hide_actions={true}
          onChange={(data) => setFormData(data)}
        />
        <div className='Buttons-btn'>
          <button
            onClick={async () => {
              if (formData) {
                await handleSubmit(formData);
              } else {
                setError("Please fill out the form before submitting.");
              }
            }}
            className='Submit-btn'
          >
            Submit
          </button>
          <button
            onClick={async () => {
              if (formData) {
                await handleSave(formData);
              } else {
                setError("Please fill out the form before saving.");
              }
            }}
            className='Save-btn'
          >
            Save
          </button>
          <button  className="Back-btn" onClick={goBack}>Back</button>
        </div>
      </div>
    </>
  );
};

export default FormComponent;