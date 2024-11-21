import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sp } from "@pnp/sp/presets/all";
import { ReactFormGenerator } from 'react-form-builder2';
import './EditTransactionForm.css'
import TopNavBar from './TopBar';
import Sidebar from './SideNavBar';
import LoadingSpinner from './Loading';

const ViewForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Retrieve the ID from the route
    const [formData, setFormData] = useState<any[]>([]);
    const [formJSON, setFormJSON] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isCurApprover, setIsCurApprover] = useState<boolean>(false); // State to track if the user is CurApprover
    const [curApproverEmail, setCurApproverEmail] = useState<string | null>(null);
    const [AppCodevalue, setAppCodevalue] = useState<any[]>([]);
    const [ProcessDataDestiQueue, setProcessDataDestiQueue] = useState<any[]>([]);

    const navigate = useNavigate()

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                // Fetch the form data by ID from the WorkFlowProcessData list
                const transactionItem = await sp.web.lists.getByTitle("WorkFlowProcessData").items.getById(Number(id)).get();
                const parsedFormData = JSON.parse(transactionItem.FormData); // Parse FormData JSON
                setFormData(parsedFormData);

                const appCode = transactionItem.AppCode;
                const curApproverId = transactionItem.CurApproverId;
                const ProcessDataDestiQueue = transactionItem.DestinationQueue;
                setCurApproverEmail(curApproverId);
                setAppCodevalue(appCode);
                setProcessDataDestiQueue(ProcessDataDestiQueue)
                console.log("CurAppover email from list ", curApproverEmail)
                // Fetch the corresponding FormJSON from the FormMaster list based on AppName
                const formMasterItems = await sp.web.lists.getByTitle("FormMaster").items.filter(`AppCode eq '${appCode}'`).get();
                if (formMasterItems.length > 0) {
                    const formMasterItem = formMasterItems[0];
                    const parsedFormJSON = JSON.parse(formMasterItem.FormJSON); // Parse FormJSON JSON
                    setFormJSON(parsedFormJSON);
                }


                const currentUser = await sp.web.currentUser.get();
                if (currentUser.Id === curApproverId) {
                    setIsCurApprover(true);
                }
            } catch (error) {
                console.error("Error fetching form data:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchFormData();
    }, [id]);

    const handleApprove = async () => {
        debugger;
        const buttonAction = "Approve"
        const routingRulesItems = await sp.web.lists.getByTitle("RoutingRules").items.filter(`(CurrentQueue eq '${ProcessDataDestiQueue}') and (AppCode eq '${AppCodevalue}') and (Actions eq '${buttonAction}')`).get();
        if (routingRulesItems.length > 0) {

            const { CurrentQueue, DestinationQueue, Status } = routingRulesItems[0];
            const mappingMasterItem = await sp.web.lists.getByTitle("MappingMaster").items
                .select("*", "Users_x002f_Groups/Id", "Users_x002f_Groups/Title")
                .expand("Users_x002f_Groups")
                .filter(`(Level eq '${DestinationQueue}') and (AppCode eq '${AppCodevalue}')`)
                .get();
            const MMLevel = mappingMasterItem[0].Level;
            const userGroupId = mappingMasterItem[0].Users_x002f_Groups.Id;
            if (mappingMasterItem.length === 0) {
                alert("Reviewers or Approvers are not available for further actions");
                return;
            }
            await sp.web.lists.getByTitle("WorkFlowProcessData").items.getById(Number(id)).update({


                CurrentQueue: CurrentQueue,
                DestinationQueue: DestinationQueue,
                Status: Status,
                CurApproverId: userGroupId,
                Level: MMLevel,
            });
            alert("You have approved the request");
            navigate('/InProcess');
        }
        else {
            alert("Routing Rules are not available for further actions");
            return;
        }

    };

    const handleReject = async () => {
        debugger;
        const buttonAction = "Reject"
        const routingRulesItems = await sp.web.lists.getByTitle("RoutingRules").items.filter(`(CurrentQueue eq '${ProcessDataDestiQueue}') and (AppCode eq '${AppCodevalue}') and (Actions eq '${buttonAction}')`).get();
        if (routingRulesItems.length > 0) {

            const { CurrentQueue, DestinationQueue, Status } = routingRulesItems[0];
            const mappingMasterItem = await sp.web.lists.getByTitle("MappingMaster").items
                .select("*", "Users_x002f_Groups/Id", "Users_x002f_Groups/Title")
                .expand("Users_x002f_Groups")
                .filter(`(Level eq '${DestinationQueue}') and (AppCode eq '${AppCodevalue}')`)
                .get();
            const MMLevel = mappingMasterItem[0].Level;
            const userGroupId = mappingMasterItem[0].Users_x002f_Groups.Id;
            if (mappingMasterItem.length === 0) {
                alert("Reviewers or Approvers are not available for further actions");
                return;
            }
            await sp.web.lists.getByTitle("WorkFlowProcessData").items.getById(Number(id)).update({


                CurrentQueue: CurrentQueue,
                DestinationQueue: DestinationQueue,
                Status: Status,
                CurApproverId: userGroupId,
                Level: MMLevel,
            });
            alert("You have Rejected the request");
            navigate('/InProcess');
        }
        else {
            alert("Routing Rules are not available for further actions");
            return;
        }



    };

    const handleReturn = async () => {
        debugger;
        const buttonAction = "Return"
        const routingRulesItems = await sp.web.lists.getByTitle("RoutingRules").items.filter(`(CurrentQueue eq '${ProcessDataDestiQueue}') and (AppCode eq '${AppCodevalue}') and (Actions eq '${buttonAction}')`).get();
        if (routingRulesItems.length > 0) {

            const { CurrentQueue, DestinationQueue, Status } = routingRulesItems[0];
            const mappingMasterItem = await sp.web.lists.getByTitle("MappingMaster").items
                .select("*", "Users_x002f_Groups/Id", "Users_x002f_Groups/Title")
                .expand("Users_x002f_Groups")
                .filter(`(Level eq '${DestinationQueue}') and (AppCode eq '${AppCodevalue}')`)
                .get();
            const MMLevel = mappingMasterItem[0].Level;
            const userGroupId = mappingMasterItem[0].Users_x002f_Groups.Id;
            if (mappingMasterItem.length === 0) {
                alert("Reviewers or Approvers are not available for further actions");
                return;
            }
            await sp.web.lists.getByTitle("WorkFlowProcessData").items.getById(Number(id)).update({


                CurrentQueue: CurrentQueue,
                DestinationQueue: DestinationQueue,
                Status: Status,
                CurApproverId: userGroupId,
                Level: MMLevel,
            });
            alert("You have returned the request");
            navigate('/InProcess');
        }
        else {
            alert("Routing Rules are not available for further actions");
            return;
        }
    };

    const handleCancel = () => {

        navigate('/InProcess');
        console.log("Canceled");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TopNavBar />
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div>
                    <h2>View Form</h2>
                    {loading ? (
                        <LoadingSpinner/>
                    ) : (
                        <>
                            <ReactFormGenerator
                                data={formJSON}
                                read_only={true}
                                form_action=""
                                form_method=""
                                answer_data={formData}
                            />
                            {isCurApprover && ( // Render buttons only if the user is CurApprover
                                <div>
                                    <button className='Submit-btn' onClick={handleApprove}>Approve</button>
                                    <button className='Submit-btn' onClick={handleReject}>Reject</button>
                                    <button className='Submit-btn' onClick={handleReturn}>Return</button>
                                    <button className='Submit-btn' onClick={handleCancel}>Cancel</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ViewForm;



