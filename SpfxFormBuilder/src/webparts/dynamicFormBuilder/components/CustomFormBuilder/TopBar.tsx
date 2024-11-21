import * as React from 'react';
import { sp } from '@pnp/sp';
import "./TopBar.css";

interface IUser {
  title: string;
  picture: string;
}

const TopNavBar: React.FunctionComponent = () => {
  const [user, setUser] = React.useState<IUser | null>(null);

  React.useEffect(() => {
    // Fetch user information when the component mounts
    const fetchUserInfo = async () => {
      try {
        // Fetch the current user details
        const currentUser = await sp.web.currentUser();
        
        // Construct the profile image URL using the logged-in user's email
        const currentLoggedInEmail = currentUser.Email;
        const profileImageUrl = `https://smrtofcnxt.sharepoint.com/sites/SmartOfficeREDEV/_layouts/15/userphoto.aspx?size=L&accountName=${currentLoggedInEmail}&default=true`;
        console.log(profileImageUrl)
        setUser({
          title: currentUser.Title,
          picture: profileImageUrl,
        });
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    void fetchUserInfo();
  }, []); // Empty dependency array ensures it only runs once when the component mounts

  return (
    <header className="topNavbar">
       <div>
        <img src="https://smrtofcnxt.sharepoint.com/sites/smartofficenxtdev/SiteAssets/images/logo-smartoffice.png" alt="imageOflogo-smartoffice"/>
        </div>
        
      <div className="userProfile">
        {user ? (
          <>
            <img src={user.picture} alt="User Profile" className="profileImg" />
            <span>{user.title}</span>
          </>
        ) : (
          <div className="logo">
            <img 
              src="https://smrtofcnxt.sharepoint.com/sites/SmartOfficeREDEV/Shared%20Documents/Logo.png" 
              alt="Logo"
            />
          </div>
        )}
      </div>
     
    </header>
  );
};

export default TopNavBar;