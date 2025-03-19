import React, { useState, useEffect } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {Checkbox, FormControlLabel} from "@mui/material";


const LoginPage = ({ onLogin }) => {
  
  const [ip, setIp] = useState("");
  const [peerPort, setPeerPort] = useState("");
  const [isContributor, setIsContributor] = useState(false);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/ip");
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
        const response = await fetch(`http://192.168.80.32:5003/download_server_start`,); //MODIFIER IP ET PORT ICI
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
      }}
    >
      <h2>Connexion au Réseau</h2>
      <ThemeProvider theme={theme}>
        <TextField
          label="Adresse IP"
          variant="outlined"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          sx={{ marginBottom: 2, input: { color: "#d9d9d9" } }}
        />
      {/* Champ pour entrer le port */}
      <TextField
          label="Port"
          variant="outlined"
          type="number"
          value={peerPort}
          onChange={(e) => setPeerPort(e.target.value)}
          sx={{ marginBottom: 2, width: "300px" }}
        />

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



// import React, { useState } from 'react';

// const FileList = () => {
//   const [files, setFiles] = useState([]); // Pour stocker les données des fichiers
//   const [error, setError] = useState(null); // Pour gérer les erreurs

//   // Fonction pour récupérer les fichiers de l'API
//   const fetchFiles = async () => {
//     try {
//       const response = await fetch("http://192.168.80.32:5002/list_dht"); // API URL
//       const data = await response.json();
//       console.log(response)
//       console.log(data)
//       if (data.list_files_storage) {
//         // Convertir l'objet en tableau
//         const filesArray = Object.entries(data.list_files_storage);
//         setFiles(filesArray); // Mettre à jour l'état avec les données récupérées
//       } else {
//         setError("Aucun fichier trouvé.");
//       }
//     } catch (err) {
//       setError("Erreur lors de la récupération des fichiers.");
//     }
//   };

//   return (
//     <div>
//       {/* Bouton pour lancer la récupération des fichiers */}
//       <button onClick={fetchFiles}>Find Files</button>

//       {/* Affichage des fichiers sous forme de tableau */}
//       {error && <p>{error}</p>}
      
//       <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr>
//             <th>Nom du fichier</th>
//             <th>Clé du fichier</th>
//           </tr>
//         </thead>
//         <tbody>
//           {files.length > 0 ? (
//             files.map(([fileName, fileKey], index) => (
//               <tr key={index}>
//                 <td>{fileName}</td>
//                 <td>{fileKey}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="2">Aucun fichier disponible</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default FileList;
