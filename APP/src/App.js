import React, { useState } from "react";
import LoginPage from "./LoginPage";
import Page from "./Page";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ip, setIp] = useState("");
  const [peerPort, setPeerPort] = useState("");
   const [isContributor, setIsContributor] = useState(false);

  const handleLogin = (enteredIp,enteredPort,isContributor) => {
    console.log("Données reçues dans handleLogin:", enteredIp, enteredPort);
    setIp(enteredIp);
    setPeerPort(enteredPort);
    setIsContributor(isContributor)
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIp("");
    setPeerPort("")
    setIsLoggedIn(false);
  };

  return (
    <div>
      {isLoggedIn ? <Page ip={ip} peerPort={peerPort} isContributor={isContributor} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}

    </div>
    
  );
};

export default App;
