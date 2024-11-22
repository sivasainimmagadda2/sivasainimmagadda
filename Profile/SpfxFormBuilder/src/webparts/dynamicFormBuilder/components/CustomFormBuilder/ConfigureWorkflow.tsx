import * as React from 'react';
import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import SideNavBar from './SideNavBar';
import TopNavBar from './TopBar';
import './CustomForm.css';
import { BaseWebPartContext } from '@microsoft/sp-webpart-base';
import { MouseEventHandler, Component } from 'react';

interface ApproverData {
    Role: string;
    User: string;
    Level: string;
    AppName: string;
    AppCode: string;
    Id: number;
}

interface ConfigureWorkflowProps {
    context: BaseWebPartContext;
}

interface ConfigureWorkflowState {
    approverData: ApproverData[];
    showDialog: boolean;
    selectedUser: string;
    formMasterItems: { AppName: string; AppCode: string }[];
    selectedAppCode: string;
    roleOptions: string[];
    selectedRole: string;
    level: number;
}

class ConfigureWorkflow extends Component<ConfigureWorkflowProps, ConfigureWorkflowState> {
    constructor(props: ConfigureWorkflowProps) {
        super(props);

        sp.setup({
            spfxContext: this.props.context as any,
        });

        this.state = {
            selectedRole: '',
            level: 0,
            selectedAppCode: '',
            selectedUser: '',
            formMasterItems: [],
            approverData: [],
            showDialog: false,
            roleOptions: ['Role1', 'Role2', 'Role3'],
        };
    }

    async componentDidMount() {
        try {

            const data = await sp.web.lists
                .getByTitle('MappingMaster')
                .items.select('Role', 'Users_x002f_Groups/Title', 'Level', 'AppName', 'AppCode', 'Id')
                .expand('Users_x002f_Groups')
                .get();

            const approverData = data.map((item: any) => ({
                Role: item.Role,
                User: item.Users_x002f_Groups ? item.Users_x002f_Groups.Title : '',
                Level: item.Level,
                AppName: item.AppName,
                AppCode: item.AppCode,
                Id: item.Id,
            }));


            const formMasterData = await sp.web.lists
                .getByTitle('FormMaster')
                .items.select('AppName', 'AppCode')
                .get();

            this.setState({ approverData, formMasterItems: formMasterData });
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error adding new approver:', error);
                alert(`Error adding new approver: ${error.message}`);
            } else {
                console.error('An unknown error occurred:', error);
                alert('An unknown error occurred.');
            }
        }

    }

    onApproverClick: MouseEventHandler<HTMLButtonElement> = () => {
        this.setState({ showDialog: true });
    };

    closeDialog: MouseEventHandler<HTMLButtonElement> = () => {
        this.setState({ showDialog: false, selectedUser: '' });
    };

    onDeleteApprover = (id: number) => {
        console.log(`Delete approver with Id: ${id}`);
    };

    private onAddApprover = async () => {
        try {
            console.log('Starting to add new approver...');


            const email = this.state.selectedUser.trim();
            if (!email) {
                alert('Please enter a valid email address.');
                return;
            }


            const user = await sp.web.siteUsers
                .filter(`Email eq '${email}'`)
                .select('Id,Email')
                .get();

            if (user.length === 0) {
                alert('User not found.');
                return;
            }


            await sp.web.lists.getByTitle('MappingMaster').items.add({
                Role: this.state.selectedRole,
                Level: this.state.level,
                AppName: this.state.formMasterItems.find((item) => item.AppCode === this.state.selectedAppCode)?.AppName || '',
                AppCode: this.state.selectedAppCode,
                Users_x002f_GroupsId: user[0].Id,
            });

            console.log('Item added successfully.');
            alert('New approver added successfully!');

    
            this.setState({
                showDialog: false,
                selectedUser: '',
                selectedAppCode: '',
            });


            await this.componentDidMount();
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error adding new approver:', error);
                alert(`Error adding new approver: ${error.message}`);
            } else {
                console.error('An unknown error occurred:', error);
                alert('An unknown error occurred.');
            }
        }

    };


    onAppSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedAppCode = event.target.value;
        console.log(`App Code selected: ${selectedAppCode}`);


        const selectedApp = this.state.formMasterItems.find((item) => item.AppCode === selectedAppCode);

        if (selectedApp) {
            console.log(`App Name: ${selectedApp.AppName}, App Code: ${selectedApp.AppCode}`);


            const appData = this.state.approverData.filter((approver) => approver.AppCode === selectedAppCode);

            if (appData.length === 0) {

                this.setState({
                    roleOptions: ['Creator'],
                    selectedRole: 'Creator',
                    level: 0,
                });
            } else {

                const levels = appData.map((approver) => parseInt(approver.Level, 10));
                const maxLevel = Math.max(...levels);
                const lastRole = appData.find((approver) => parseInt(approver.Level, 10) === maxLevel)?.Role;

                if (lastRole === 'Creator') {
                    this.setState({
                        roleOptions: ['Reviewer', 'Approver'],
                        selectedRole: 'Reviewer',
                        level: maxLevel + 1,
                    });
                } else if (lastRole === 'Reviewer') {
                    this.setState({
                        roleOptions: ['Reviewer', 'Approver'],
                        selectedRole: 'Reviewer',
                        level: maxLevel + 1,
                    });
                } else if (lastRole === 'Approver') {
                    this.setState({
                        roleOptions: ['Approver'],
                        selectedRole: 'Approver',
                        level: maxLevel + 1,
                    });
                }
            }
        } else {
            console.log('App Code does not exist in FormMaster list');


            this.setState({
                roleOptions: ['Creator'],
                selectedRole: 'Creator',
                level: 0,
            });
        }


        this.setState({ selectedAppCode });
    };

    render() {

        const filteredApproverData = this.state.selectedAppCode
            ? this.state.approverData.filter(data => data.AppCode === this.state.selectedAppCode)
            : this.state.approverData;

        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <TopNavBar />
                <div style={{ display: 'flex' }}>
                    <SideNavBar />
                    <div className='Table'>
                        <label htmlFor="appSelect">App Name:</label>
                        <select
                            id="appSelect"
                            value={this.state.selectedAppCode}
                            onChange={this.onAppSelectChange}
                        >
                            <option value="">All Apps</option>
                            {this.state.formMasterItems.map((item, index) => (
                                <option key={index} value={item.AppCode}>
                                    {item.AppName}
                                </option>
                            ))}
                        </select>

                        <div style={{ height: '500px', overflow: 'auto' }}>
                            <table className="ta-table1">
                                <thead style={{ background: 'none' }}>
                                    <tr>
                                        <th>Role</th>
                                        <th>User</th>
                                        <th>Level</th>
                                        <th>App Name</th>
                                        <th className="flex-action">
                                            <button
                                                style={{ cursor: 'pointer' }}
                                                onClick={this.onApproverClick}
                                                className="add-approver-btn"
                                            >
                                                Add Approver
                                            </button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApproverData.map((data, idx) => (
                                        <tr key={idx}>
                                            <td>{data.Role}</td>
                                            <td>{data.User}</td>
                                            <td>{data.Level}</td>
                                            <td>{data.AppName}</td>
                                            <td>
                                                <div className="all-edit">

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {this.state.showDialog && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h2>Add Approver</h2>
                                    <div className="form-group">
                                        <label htmlFor="roleSelect">Role:</label>
                                        <select
                                            id="roleSelect"
                                            value={this.state.selectedRole}
                                            onChange={(e) => {
                                                this.setState({ selectedRole: e.target.value });
                                            }}
                                        >
                                            {this.state.roleOptions.map((role, index) => (
                                                <option key={index} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>

                                        <label>Level: {this.state.level}</label>

                                        <div>
                                            <label>Approver Email:</label>
                                            <input
                                                type="email"
                                                value={this.state.selectedUser}
                                                onChange={(e) => this.setState({ selectedUser: e.target.value })}
                                            />
                                        </div>
                                        <div className="modal-buttons">
                                            <button className='Add_btn' onClick={this.onAddApprover}>Add</button>
                                            <button className='Add_btn' onClick={this.closeDialog}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

}

export default ConfigureWorkflow;

