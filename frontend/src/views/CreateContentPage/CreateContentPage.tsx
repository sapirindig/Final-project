import Sidebar from "../../components/Sidebar/Sidebar"; 
import ChatBox from "../../components/ChatBox/ChatBox"; 
import "./CreateContentPage.css"; 

const CreateContentPage = () => {
  return (
    <div className="container">
      <Sidebar />

      <div className="main-content">
      <div className="header-container">
  <h1>
    Save time and boost engagement with the<br />
    <span className="highlight">smartest AI tools</span>&nbsp;
    for social media
  </h1>
</div>

        <ChatBox />
      </div>
    </div>
  );
};

export default CreateContentPage;
