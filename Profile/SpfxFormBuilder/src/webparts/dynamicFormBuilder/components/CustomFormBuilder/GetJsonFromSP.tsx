import * as React from 'react';
import { useState, useEffect } from 'react';
import { sp } from "@pnp/sp/presets/all";
import FormComponent from './FormComponent';
import { IDynamicFormBuilderProps } from '../IDynamicFormBuilderProps';
import './GetData.css';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import SideNavBar from './SideNavBar';
import TopNavBar from './TopBar';
import LoadingSpinner from './Loading';

interface FormItem {
    AppName: string;
    Author: {
        Title: string;
    };
    FormJSON: string;
    AppCode: string;
    FormType: string; // Ensure this column is present in your SharePoint list
}

interface FormType {
    Title: string; // Assuming 'Title' is the column holding the form type name
}

const GetData: React.FC<IDynamicFormBuilderProps> = (props) => {
    const [formItems, setFormItems] = useState<FormItem[]>([]); // List of form items
    const [formTypes, setFormTypes] = useState<FormType[]>([]); // List of form types
    const [selectedFormJSON, setSelectedFormJSON] = useState<any[]>([]); // Form JSON data for selected form
    const [selectedFormTitle, setSelectedFormTitle] = useState<string | null>(null); // Selected form title
    const [selectedFormAppCode, setSelectedFormAppCode] = useState<string | null>(null); // Selected form AppCode
    const [error, setError] = useState<string | null>(null); // Error message
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loading spinner state
    const [isFormSelected, setIsFormSelected] = useState<boolean>(false); // To determine if a form is selected
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [, setHoverData] = useState<string | null>(null)
    const [draftCount, setDraftCount] = useState(0);
    const [inProgressCount, setInProgressCount] = useState(0);

    const navigate = useNavigate();

    // Fetch all form titles (from FormMaster list)
    const fetchFormTitles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const items = await sp.web.lists.getByTitle("FormMaster").items
                .select("AppName", "Author/Title", "FormJSON", "AppCode", "FormType")
                .expand("Author")
                .get();
            setFormItems(items);
        } catch (error) {
            console.error("Error fetching form titles:", error);
            setError("An error occurred while fetching form titles.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all form types (from FormType list)
    const fetchFormTypes = async () => {
        try {
            const types = await sp.web.lists.getByTitle("FormType").items
                .select("Title") 
                .get();
            setFormTypes(types);
        } catch (error) {
            console.error("Error fetching form types:", error);
        }
    };

    
    const getFormDataByTitle = async (title: string) => {
        try {
            const selectedForm = formItems.find(item => item.AppName === title);
            if (selectedForm) {
                setSelectedFormJSON(JSON.parse(selectedForm.FormJSON));
                setSelectedFormTitle(selectedForm.AppName);
                setSelectedFormAppCode(selectedForm.AppCode);
                setIsFormSelected(true);
            }
        } catch (error) {
            console.error("Error getting form data by title:", error);
            setError("An error occurred while loading the form.");
        }
    };

    async function getStatusCounts() {
        try {

            const inProgressCount = await sp.web.lists.getByTitle('WorkFlowProcessData')
                .items.filter("Status eq 'In-Progress'")
                .getAll();


            const draftCount = await sp.web.lists.getByTitle('WorkFlowProcessData')
                .items.filter("Status eq 'Draft'")
                .getAll();


            setInProgressCount(inProgressCount.length);
            setDraftCount(draftCount.length);

            console.log("In-Progress count:", inProgressCount.length);
            console.log("Draft count:", draftCount.length);
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    }
    getStatusCounts().catch((error) => {
        console.error("Unhandled error:", error);
    });
    const fetchMappingMasterData = async (appCode: string) => {
        try {
            const mappingItems = await sp.web.lists.getByTitle("MappingMaster").items
                .filter(`AppCode eq '${appCode}'`)
                .select("Users_x002f_Groups/Title", "Level", "Role")
                .expand("Users_x002f_Groups")
                .get();

            if (mappingItems.length > 0) {
                const formattedData = mappingItems.map(item => ({
                    Title: item.Users_x002f_Groups?.Title,
                    Level: item.Level,
                    Role: item.Role,
                }));

                // Update hoverData with formatted information as a string
                setHoverData(
                    `${formattedData}`
                );
                console.log(`Filtered data for AppCode '${appCode}':`, formattedData[0].Title);
            } else {
                console.log(`No data found in MappingMaster list for AppCode '${appCode}'.`);
                setHoverData(null); // Reset hoverData if no items found
            }
        } catch (error) {
            console.error("Error fetching data from MappingMaster list:", error);
            setHoverData(null); // Reset hoverData on error
        }
    };


    // Navigate to the MappingMaster page
    const navigateToMappingMaster = (appCode: string | null, appName: string, authorName: string) => {
        if (appCode) {
            navigate(`/MappingMaster/${appCode}?appName=${appName}&authorName=${authorName}`);
        }
    };

    // Go back to the form selection screen
    const goBack = () => {
        setIsFormSelected(false);
        setSelectedFormJSON([]);
        setSelectedFormTitle(null);
        setSelectedFormAppCode(null);
    };

    useEffect(() => {
        sp.setup({
            spfxContext: props.context as any,
        });
        fetchFormTitles().catch((error) => {
            console.error("Error in fetchFormTitles:", error);
        });
        fetchFormTypes().catch((error) => {
            console.error("Error in fetchFormTypes:", error);
        });
    }, [props.context]);

    // Filter forms based on the selected category
    const getFilteredForms = () => {
        if (selectedCategory === 'All') {
            return formItems;

        }
        console.log(formItems)
        return formItems.filter(item => item.FormType === selectedCategory);
    };

    return (
        <div style={{ display: 'flex', flexDirection: "column" }}>
            <TopNavBar />
            <div style={{ display: 'flex' }}>
                {/* <SideNavBar /> */}
                <div style={{ width: '100%' }}>
                    {!isFormSelected ? (
                        <>
                            <div style={{ margin: "20px", flex: 1 }}>
                                <div className='allRecardsCards'>
                                    <RouterLink to="/InProcess" className='RoutLink'>
                                        <div className='Recard-Cards'>
                                            <div className='InProcess-Card'>
                                                <h6>Pending Approval</h6>


                                                <div className='Icon-Count'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-file-text">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                                        <line x1="10" y1="9" x2="8" y2="9"></line>
                                                    </svg>
                                                    <p>{inProgressCount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </RouterLink>
                                    <RouterLink to="/Draft" className='RoutLink'>
                                        <div className='Recard-Cards'>
                                            <div className='Draft-Card'>
                                                <h6>My Documents</h6>


                                                <div className='Icon-Count-Draft'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-file-text">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                                        <line x1="10" y1="9" x2="8" y2="9"></line>
                                                    </svg>
                                                    <p>{draftCount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </RouterLink>
                                    <RouterLink to="/CreateForm" className='RoutLink'>
                                        <div className='Recard-Cards'>
                                            <div className='Create-Card'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus">
                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                </svg>

                                                <h6>Create Form</h6>
                                            </div>
                                        </div>
                                    </RouterLink>
                                    <RouterLink to="/ConfigureWorkflow" className='RoutLink'>
                                        <div className='Recard-Cards'>
                                            <div className='InProcess-Card'>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-settings" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                    <path d="M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0 -8" />
                                                    <path d="M4.6 9l-.6 -2.3l2.3 -.6l1.4 2.2a7.8 7.8 0 0 0 -1 1.6l-2.1 -.9z" />
                                                    <path d="M19.4 9l.6 -2.3l-2.3 -.6l-1.4 2.2a7.8 7.8 0 0 0 1 1.6l2.1 -.9z" />
                                                    <path d="M12 4.5a7.5 7.5 0 0 1 3.8 1" />
                                                    <path d="M12 19.5a7.5 7.5 0 0 1 -3.8 -1" />
                                                    <path d="M9 12l-2 1" />
                                                    <path d="M15 12l2 -1" />
                                                </svg>

                                                <h6>Create WorkFlow</h6>
                                            </div>
                                        </div>
                                    </RouterLink>
                                </div>
                            </div>
                            <div className='Search-container'>
                                <input className='searchBar' type='search' placeholder="Ask me anything?" />
                                <img className='mic' src={require("../../assets/Images/mic.png")} />

                            </div>
                            <div className='AvailableFormsContainer'>
                                <div>
                                    <ul className='Select_Btn'>
                                        <li
                                            style={{ marginLeft: '-40px', borderTopLeftRadius: '0px' }}
                                            className={selectedCategory === 'All' ? 'onSelect' : 'onOthers'}
                                            onClick={() => setSelectedCategory('All')}
                                        >
                                            All
                                        </li>
                                        {formTypes.map((type) => (
                                            <li
                                                key={type.Title}
                                                className={selectedCategory === type.Title ? 'onSelect' : 'onOthers'}
                                                onClick={() => setSelectedCategory(type.Title)}
                                            >
                                                {type.Title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {error && <div style={{ color: "red", margin: "10px" }}>{error}</div>}
                                {isLoading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="card-container" style={{ height: '440px', overflow: 'auto', width: '83vw' }}>
                                        {getFilteredForms().length > 0 ? (
                                            getFilteredForms().map((item) => (
                                                <div className="card" key={item.AppName}>
                                                    <RouterLink
                                                        to={{
                                                            pathname: '/FormDashBoard',
                                                        }}
                                                        state={{ appcode: item.AppCode, appname:item.AppName }} 
                                                        className='RoutLink'
                                                    >
                                                        <div className='Card_Icon_Heading'>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="form-pen-icon" viewBox="0 0 24 24">
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                                <line x1="10" y1="9" x2="8" y2="9"></line>
                                                                <path d="M16 21l2-2a1 1 0 0 0 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-2 2"></path>
                                                                <line x1="17" y1="16" x2="21" y2="20"></line>
                                                            </svg>
                                                            <h5 className='CardHeading'>{item.AppName}</h5>
                                                        </div>
                                                    </RouterLink>

                                                    <div className='ButtonContainer'>
                                                        <button className='CreateNew_Btn' onClick={() => getFormDataByTitle(item.AppName)}>Create New +</button>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="idea-light-pen-icon"
                                                            viewBox="0 0 24 24"
                                                            onClick={() => navigateToMappingMaster(item.AppCode, item.AppName, item.Author?.Title)}
                                                            onMouseEnter={() => fetchMappingMasterData(item.AppCode)}
                                                        >
                                                            <path d="M9 18h6a3 3 0 0 0 3-3 5 5 0 0 0-5-5V8a5 5 0 0 0-5 5 3 3 0 0 0 3 3z"></path>
                                                            <line x1="9" y1="22" x2="15" y2="22"></line>
                                                            <line x1="10" y1="20" x2="14" y2="20"></line>
                                                            <path d="M16 21l2-2a1 1 0 0 0 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-2 2"></path>
                                                            <line x1="17" y1="16" x2="21" y2="20"></line>
                                                        </svg>
                                                    </div>
                                                    {/* <div className='HoverCard'>
                                                        {hoverData ? (
                                                            <p>{hoverData[1]}</p>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </div> */}

                                                </div>
                                            ))
                                        ) : (
                                            // <div>No forms available in this category.</div>
                                            ""
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <FormComponent
                            selectedFormJSON={selectedFormJSON}
                            selectedFormTitle={selectedFormTitle!}
                            selectedFormAppCode={selectedFormAppCode!}
                            goBack={goBack}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GetData;
