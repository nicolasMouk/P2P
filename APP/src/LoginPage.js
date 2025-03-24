import React, { useState, useEffect } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {Checkbox, FormControlLabel,Typography} from "@mui/material";


const LoginPage = ({ onLogin }) => {
  
  const [ip, setIp] = useState("");
  const [peerPort, setPeerPort] = useState("");
  const [isContributor, setIsContributor] = useState(false);

  // useEffect(() => {
  //   const fetchIp = async () => {
  //     try {
  //       const response = await axios.get("https://e63a-163-5-3-4.ngrok-free.app/api/ip");
  //       console.log("Réponse IP :", response.data);
  //       setIp(response.data.ip);
  //     } catch (error) {
  //       console.error("Erreur lors de la récupération de l'adresse IP :", error);
  //     }
  //   };

  //   fetchIp();
  // }, []);

  useEffect(() => { 
    const fetchIp = async () => {
      try {
        const response = await axios.get("https://5466-163-5-3-4.ngrok-free.app/api/ip", {
          headers: {
            "ngrok-skip-browser-warning": "true" // Ajoute cet en-tête
          }
        });
        console.log("Réponse IP :", response.data);
        setIp(response.data.ip);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'adresse IP :", error);
      }
    };
  
    fetchIp();
  }, []);
  
 
  const handleLogin = async () => {
    try {
      if (isContributor) {
        const response = await fetch(`https://5466-163-5-3-4.ngrok-free.app/download_server_start`,{
          headers: {
            "ngrok-skip-browser-warning": "true" // Ajoute cet en-tête
          }
        }); //MODIFIER IP ET PORT ICI
        console.log(response.data)
        if (!response.ok) {
          throw new Error("Erreur lors du téléchargement du fichier");
        }
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "server_files.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      // Exécuter onLogin dans tous les cas
      onLogin(ip, peerPort, isContributor);
    }
  };

  const theme = createTheme({
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiInputBase-input": {
              color: "white",
            },
            "& .MuiInputLabel-root": {
              color: "white",
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "white",
            },
            "&:hover .MuiInput-underline:before": {
              borderBottomColor: "lightgray",
            },
            "& fieldset": {
              borderColor: "white",
            },
            "&:hover fieldset": {
              borderColor: "lightgray",
            },
            "&.Mui-focused fieldset": {
              borderColor: "blue",
            },
          },
        },
      },
    },
  });

  return (
    
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        color: "#d9d9d9",
        padding: 2,
      }}
    >
      <Typography variant="h2" sx={{ color: "#d9d9d9", fontWeight: "bold", marginBottom: 7 }}>
        NodeLink
      </Typography>
      {/* <h2>Connexion au Réseau</h2> */}

      <Typography variant="h5" sx={{ color: "#d9d9d9", textAlign: "center" }}>
        Connectez-vous à votre réseau et partagez des fichiers en toute simplicité !
      </Typography>
      <Typography variant="h6" sx={{ color: "#d9d9d9", textAlign: "center", marginBottom: 1 }}>
        Devenez contributeur pour faire vivre notre réseau !
      </Typography>
      <ThemeProvider theme={theme}>
        {/* <TextField
          label="Adresse IP"
          variant="outlined"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          sx={{ marginBottom: 2, input: { color: "#d9d9d9" } }}
        /> */}
      {/* Champ pour entrer le port */}
      {/* <TextField
          label="Port"
          variant="outlined"
          type="number"
          value={peerPort}
          onChange={(e) => setPeerPort(e.target.value)}
          sx={{ marginBottom: 2, width: "300px" }}
        /> */}

      <FormControlLabel
        control={<Checkbox
          checked={isContributor}
          onChange={(e) => setIsContributor(e.target.checked)}
          sx={{
            color: "white", // Couleur de l'icône non cochée
            "&.Mui-checked": {
              color: "white", // Couleur de l'icône cochée
            },
            "& .MuiSvgIcon-root": {
              border: "2px solid white", // Bordure blanche
              borderRadius: "4px", // Coins arrondis
            },
          }}
        />}
        label="Contributeur (héberger des fichiers)"
      />

      </ThemeProvider>
      <Button variant="contained" onClick={handleLogin}>
        Se Connecter
      </Button>
    </Box>
  );
};


export default LoginPage;

// <Box
// sx={{
//   height: "100vh",
//   display: "flex",
//   flexDirection: "column",
//   justifyContent: "center",
//   alignItems: "center",
//   backgroundColor: "#1a1a1a",
//   color: "#d9d9d9",
// }}
// >
// <h1>NodeLink</h1>
// <h2>Connexion au Réseau</h2>
// <ThemeProvider theme={theme}>
//   <TextField
//     label="Adresse IP"
//     variant="outlined"
//     value={ip}
//     onChange={(e) => setIp(e.target.value)}
//     sx={{ marginBottom: 2, input: { color: "#d9d9d9" } }}
//   />

// <TextField
//     label="Port"
//     variant="outlined"
//     type="number"
//     value={peerPort}
//     onChange={(e) => setPeerPort(e.target.value)}
//     sx={{ marginBottom: 2, width: "300px" }}
//   />

// <FormControlLabel
//   control={<Checkbox
//     checked={isContributor}
//     onChange={(e) => setIsContributor(e.target.checked)}
//     sx={{
//       color: "white", // Couleur de l'icône non cochée
//       "&.Mui-checked": {
//         color: "white", // Couleur de l'icône cochée
//       },
//       "& .MuiSvgIcon-root": {
//         border: "2px solid white", // Bordure blanche
//         borderRadius: "4px", // Coins arrondis
//       },
//     }}
//   />}
//   label="Contributeur (héberger des fichiers)"
// />

// </ThemeProvider>
// <Button variant="contained" onClick={handleLogin}>
//   Se Connecter
// </Button>
// </Box>


