import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { sp } from "@pnp/sp/presets/all";
import LoadingSpinner from './Loading';
import Sidebar from './SideNavBar';
import TopNavBar from './TopBar';
import "./MappingMasterComponent.css"
interface MappingMasterData {
    Role: string;
    Level: string;
    Users_x002f_Groups: { Title: string };
    AppName: string;
    AppCode: string;
    Author: { Title: string };
}

const MappingMasterComponent: React.FC = () => {
    const { appCode } = useParams<{ appCode: string }>();
    const location = useLocation();
    const { appName, author } = location.state || {};
    const [mappingData, setMappingData] = useState<MappingMasterData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSpinnerVisible, setIsSpinnerVisible] = useState<boolean>(false);


    console.log('AppName:', appName);
    console.log('Author:', author);

    useEffect(() => {
        const fetchMappingData = async () => {
            setIsLoading(true);
            setError(null);
            setIsSpinnerVisible(true);
            const spinnerTimeout = setTimeout(() => {
                setIsSpinnerVisible(true);
            }, 10000);

            try {
                const data = await sp.web.lists
                    .getByTitle('MappingMaster')
                    .items.select('Role', 'Users_x002f_Groups/Title', 'Level', 'AppName', 'AppCode', 'Author/Title', 'Id')
                    .expand('Users_x002f_Groups', 'Author')
                    .filter(`AppCode eq '${appCode}'`)
                    .get();

                setMappingData(data);
            } catch (error) {
                console.error("Error fetching mapping data:", error);
                setError("An error occurred while fetching mapping data.");
            } finally {
                setIsLoading(false);
                setIsSpinnerVisible(false);
                clearTimeout(spinnerTimeout);
            }
        };

        void fetchMappingData();
    }, [appCode]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TopNavBar />
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div>
                    <div><strong>{appName}</strong></div>
                    {/* <p>App Name: {appName}</p> */}
                    <div><strong>Created By :{author}</strong></div>
                    {/* <p>Author: {author}</p> */}

                    {error && <div style={{ color: "red" }}>{error}</div>}


                    {isSpinnerVisible && (
                        <LoadingSpinner />
                    )}

                    {isLoading ? (
                        <></>
                    ) : (
                        <div className='AllCards'>
                            <div className="arrow"></div>

                            {mappingData.length > 0 ? (
                                mappingData.map((item, index) => (
                                    <div >
                                        <div key={index} className="arrow">
                                            <div className="content">
                                                <div><p><strong>{item.Role}:</strong></p></div>
                                                {/* <p><strong>Level:</strong> {item.Level}</p> */}
                                                <div><p> {item.Users_x002f_Groups ? item.Users_x002f_Groups.Title : 'N/A'}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div>No data available.</div>
                            )}
                        </div>

                    )}
                </div>
            </div>

        </div>
    );
};

export default MappingMasterComponent;


