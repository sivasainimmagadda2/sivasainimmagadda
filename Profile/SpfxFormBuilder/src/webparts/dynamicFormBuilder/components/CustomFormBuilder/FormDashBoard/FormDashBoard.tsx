import * as React from 'react';
import { sp } from "@pnp/sp/presets/all";
import SideNavBar from '../SideNavBar';
import TopNavBar from '../TopBar';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';

interface FormType {
    Title: string;
    Status: string;
    Id: number;
    Created: string;
}

const FormDashBoard = () => {
    const location = useLocation();
    const appcode = location.state?.appcode;
    const appname = location.state?.appname;

    const [formTypes, setFormTypes] = useState<FormType[]>([]);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [approvePercentage, setApprovePercentage] = useState<number[]>([]);

    const fetchFormTypes = async () => {
        try {
            if (appcode) {
                const types = await sp.web.lists
                    .getByTitle("WorkFlowProcessData")
                    .items
                    .filter(`AppCode eq '${appcode}' and (Status eq 'In-Progress' or Status eq 'Approved')`)
                    .select("Id", "Title", "Status", "Created")
                    .get();

                console.log("Fetched Form Types:", types);
                setFormTypes(types);

                
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                
                const monthData = months.reduce((acc, month) => {
                    acc[month] = { inProgress: 0, approved: 0, total: 0 };
                    return acc;
                }, {} as { [key: string]: { inProgress: number; approved: number; total: number } });

                
                types.forEach(item => {
                    const createdDate = new Date(item.Created);
                    const createdMonth = months[createdDate.getMonth()];
                    if (monthData[createdMonth]) {
                        monthData[createdMonth].total++;
                        if (item.Status === 'In-Progress') {
                            monthData[createdMonth].inProgress++;
                        } else if (item.Status === 'Approved') {
                            monthData[createdMonth].approved++;
                        }
                    }
                });
                const inProgressData = months.map(month => monthData[month].inProgress);
                const approvedData = months.map(month => monthData[month].approved);
                const totalData = months.map(month => monthData[month].total);
                const approvedPercentageData = months.map(month => {
                    const total = monthData[month].total;
                    return total > 0 ? parseFloat(((monthData[month].approved / total) * 100).toFixed(2)) : 0;
                });
                
                setApprovePercentage(approvedPercentageData);                
                const data = {
                    labels: months,
                    datasets: [
                        {
                            label: 'In-Progress',
                            data: inProgressData,
                            fill: false,
                            borderColor: '#42A5F5',
                            tension: 0.4,
                            pointBackgroundColor: '#42A5F5',
                            pointBorderColor: '#42A5F5',
                            pointRadius: 5,
                            borderWidth: 2
                        },
                        {
                            label: 'Approved',
                            data: approvedData,
                            fill: false,
                            borderColor: '#66BB6A',
                            tension: 0.4,
                            pointBackgroundColor: '#66BB6A',
                            pointBorderColor: '#66BB6A',
                            pointRadius: 5,
                            borderWidth: 2
                        },
                        {
                            label: 'Total Records',
                            data: totalData,
                            fill: false,
                            borderColor: '#FFA726',
                            tension: 0.4,
                            pointBackgroundColor: '#FFA726',
                            pointBorderColor: '#FFA726',
                            pointRadius: 5,
                            borderWidth: 2
                        },
                        // {
                        //     label: 'Approved Percentage',
                        //     data: approvedPercentageData,
                        //     fill: false,
                        //     borderColor: '#8E44AD', 
                        //     borderDash: [5, 5],
                        //     tension: 0.4,
                        //     pointBackgroundColor: '#8E44AD',
                        //     pointBorderColor: '#8E44AD',
                        //     pointRadius: 5,
                        //     borderWidth: 2
                        // }
                    ]
                };

                const options = {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary')
                            },
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border')
                            }
                        },
                        y: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary'),
                                stepSize: 5
                            },
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border')
                            },
                            min: 0,
                            max: 50
                        
                        }
                    }
                };

                setChartData(data);
                setChartOptions(options);
            } else {
                console.warn("No AppCode provided in location state.");
            }
        } catch (error) {
            console.error("Error fetching form types:", error);
        }
    };


    useEffect(() => {
        fetchFormTypes().catch(error => {
            console.error("Error in fetchFormTypes:", error);
        });
    }, [appcode]);

    return (
        <div style={{ display: 'flex', flexDirection: "column" }}>
            <TopNavBar />
            <div style={{ display: 'flex' }}>
                <SideNavBar />
                <div style={{ flex: 1, padding: '20px' }}>
                    <h1>{appname} Dashboard</h1>
                    {appcode ? (
                        <>
                            {/* <p>App Code: {appcode}</p> */}
                            {formTypes.length > 0 ? (
                                <div className="card" style={{ maxWidth: '600px' }}>
                                    <Chart type="line" data={chartData} options={chartOptions} />
                                </div>
                            ) : (
                                <p>No forms found for the provided App Code.</p>
                            )}
                            <p>{approvePercentage}</p>
                        </>
                    ) : (
                        <p>No App Code Provided</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormDashBoard;






// {
//     label: 'Total Records',
//     data: totalData,
//     fill: false,
//     borderColor: '#FFA726',
//     tension: 0.4,
//     pointBackgroundColor: '#FFA726',
//     pointBorderColor: '#FFA726',
//     pointRadius: 5,
//     borderWidth: 2
// },