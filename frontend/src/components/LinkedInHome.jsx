// LinkedInHome.jsx
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";

export default function LinkedInHome() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />

      {/* Body */}
      <div className="flex flex-1 pt-14">
        <LeftSidebar />
        <Feed />
        <RightSidebar />
      </div>
    </div>
  );
}
