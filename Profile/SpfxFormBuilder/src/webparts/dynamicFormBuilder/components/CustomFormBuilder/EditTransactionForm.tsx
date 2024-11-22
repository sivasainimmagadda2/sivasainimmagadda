import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sp } from "@pnp/sp/presets/all";
import { ReactFormGenerator } from 'react-form-builder2';
import './EditTransactionForm.css'
import Sidebar from './SideNavBar';
import TopNavBar from './TopBar';
import LoadingSpinner from './Loading';

const EditTransactionForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Retrieve the ID from the route
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any[]>([]);
    const [formJSON, setFormJSON] = useState<any>(null);
    const [appName, setAppName] = useState<string>(""); // Track AppName separately
    const [appCode, setAppCode] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);
    const [FormEditMode, setFormEditMode] = useState<boolean>(true);
    const [buttonView, setbuttonView] = useState(false);
    // const [returnedForCreator, setReturnedForCreator] = useState(true);
    // const [shouldSetReturned, setShouldSetReturned] = useState(false);

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const transactionItem = await sp.web.lists.getByTitle("WorkFlowProcessData").items.getById(Number(id)).get();
                const parsedFormData = JSON.parse(transactionItem.FormData);
                setFormData(parsedFormData);
                debugger;

                // if ((transactionItem.Status === "Approved") || transactionItem.Status === "Retruned") {
                //     setIsCurApprover(true);
                // }

                // setbuttonView(transactionItem.Status)
                // if ((transactionItem.Status === "Returned") && (transactionItem.DestinationQueue === "0")) {
                //     setShouldSetReturned(true);
                // } else {
                //     setShouldSetReturned(false);
                // }

                if (((transactionItem.Status === "Returned") && (transactionItem.DestinationQueue === "0")) || (transactionItem.Status === "Draft")) {
                    setbuttonView(true)
                    setFormEditMode(false)
                }

                const appCodeValue = transactionItem.AppCode;
                setAppName(transactionItem.AppName);
                setAppCode(appCodeValue)


                const formMasterItems = await sp.web.lists.getByTitle("FormMaster").items.filter(`AppCode eq '${appCodeValue}'`).get();
                if (formMasterItems.length > 0) {
                    const formMasterItem = formMasterItems[0];
                    const parsedFormJSON = JSON.parse(formMasterItem.FormJSON);
                    setFormJSON(parsedFormJSON);
                }


            } catch (error) {
                console.error("Error fetching form data:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchFormData();
    }, [id]);

    const handleFormSubmit = async () => {
        try {


            // UseState are not updating properly
            // if (shouldSetReturned) {
            //     setReturnedForCreator(false);
            // }
            const returned = await sp.web.lists.getByTitle("WorkFlowProcessData").items.getById(Number(id)).get();
            const returnedStatus = returned.Status;
            const ZeroDestinationQueue  =returned.DestinationQueue;
            const buttonAction = "Submit"
            setLoading(true);
            const routingRulesItems = await sp.web.lists.getByTitle("RoutingRules").items.filter(`(AppCode eq '${appCode}') and (Actions eq '${buttonAction}')`).get();

            debugger;

            const { CurrentQueue, DestinationQueue, Status } = routingRulesItems[0];

            if (routingRulesItems.length === 0) {
                alert("Reviewers or Approvers are not available for further actions");
                return;
            }

            const mappingMasterItem = await sp.web.lists.getByTitle("MappingMaster").items
                .select("*", "Users_x002f_Groups/Id", "Users_x002f_Groups/Title")
                .expand("Users_x002f_Groups")
                .filter(`(Level eq '${DestinationQueue}') and (AppCode eq '${appCode}')`)
                .get();

            const userGroupId = mappingMasterItem[0].Users_x002f_Groups.Id;
            const MMLevel = mappingMasterItem[0].Level



            // Add here ReSubmit login for Returned case for Creator
            if ((returnedStatus === "Returned") && (ZeroDestinationQueue === "0")) {


                await sp.web.lists.getByTitle("WorkFlowProcessData").items.getById(Number(id)).update({
                    CurrentQueue: CurrentQueue,
                    DestinationQueue: DestinationQueue,
                    Status: Status,
                    CurApproverId: userGroupId,
                    Level: MMLevel,
                });

                alert("App data successfully Resubmitted!");
                navigate(-1);
            }

            else {


                const formPrefix = appName.split(' ').map(word => word.charAt(0).toUpperCase()).join('') + "/";

                let latestNumber = 1;
                let newTitle = `${formPrefix}2024-2025/${latestNumber}`;

                // Check for existing titles with the same format
                let isUnique = false;
                while (!isUnique) {
                    const existingItems = await sp.web.lists.getByTitle("WorkFlowProcessData").items.filter(`Title eq '${newTitle}'`).get();
                    if (existingItems.length > 0) {
                        latestNumber++;
                        newTitle = `${formPrefix}2024-2025/${latestNumber}`;
                    } else {
                        isUnique = true;
                    }
                }

                const updatedFormData = JSON.stringify(formData);

                await sp.web.lists.getByTitle("WorkFlowProcessData").items.getById(Number(id)).update({
                    Title: newTitle,
                    FormData: updatedFormData,
                    CurrentQueue: CurrentQueue,
                    DestinationQueue: DestinationQueue,
                    Status: Status,
                    CurApproverId: userGroupId,
                    Level: MMLevel,
                });

                alert("App data updated successfully!");
                navigate(-1);
            }

        } catch (error) {
            console.error("Error updating form data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TopNavBar />
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div>
                    <h2>Edit Form</h2>
                    {loading ? (
                        <LoadingSpinner/>
                    ) : (
                        <div>
                            <ReactFormGenerator
                                data={formJSON}
                                read_only={FormEditMode}
                                form_action=""
                                form_method=""
                                answer_data={formData}
                                onChange={(updatedData) => setFormData(updatedData)}
                            />
                           {buttonView &&(<div style={{ marginTop: '20px' }}>
                                <button className='Submit-btn' onClick={handleFormSubmit} style={{ marginRight: '10px', marginLeft: '25px' }}>Submit</button>
                                <button className='Submit-btn' onClick={handleCancel} style={{ marginLeft: '25px' }}>Cancel</button>
                            </div>)} 
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default EditTransactionForm;

