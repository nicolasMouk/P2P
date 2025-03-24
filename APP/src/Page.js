import React, { useState,useEffect  } from "react";
import backgroundImage from './assets/background2.jpg'; 
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
// import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./Page.css"
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography,Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage"; // Icône pour les fichiers
import DevicesIcon from "@mui/icons-material/Devices"; // Icône pour les noeuds




const Page = ({ip,peerPort,isContributor,onLogout}) => {
  // console.log("IP reçue :", ip);
  // console.log("Port reçu :", peerPort);
  // console.log("Contributor :", isContributor )

  const pageStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column', // Organisation en colonne : en-tête et contenu
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    position: 'relative', // Nécessaire pour placer des éléments avec `absolute`
  };

  const headerStyle = {
    position: 'absolute', // Place le header en haut
    top: 0,
    right: 0,
    display: 'flex', // Les boutons sont côte à côte
    gap: '20px', // Espacement entre les conteneurs
    padding: '10px', // Espace autour des boutons
    borderRadius: '10px',
    background: '#212529'

  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'row', // Boutons côte à côte dans chaque conteneur
    gap: '10px', // Espacement entre les boutons
  };


  const contentContainerStyle = {
    backgroundColor: '#343a40', 
    color: 'black', // Couleur du texte
    width: '300px', // Largeur du conteneur
    padding: '20px', // Padding interne
    borderRadius: '10px', // Coins arrondis pour un effet visuel agréable
    position: 'absolute', // Permet de positionner le conteneur
    left: '3%', // Place le conteneur sur la gauche
    top: '50%', // Centre verticalement
    transform: 'translateY(-50%)', // Ajuste le décalage vertical
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Ombre pour un effet esthétique
    alignItems: 'center',
    justifyContent: 'center', // Centre horizontalement
    
  };

  const contentStyle = {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const contentStyle2 = {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: "#d9d9d9",
  };

  const contentStyle3 = {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: "#d9d9d9",
  };

  //Theme des textfields
  const theme = createTheme({
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiInputBase-input": {
              color: "white", // Couleur du texte
            },
            "& .MuiInputLabel-root": {
              color: "white", // Couleur du label
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "white", // Couleur de la ligne
            },
            "&:hover .MuiInput-underline:before": {
              borderBottomColor: "lightgray", // Ligne au survol
            },
          },
        },
      },
    },
  });

  

  

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
      </div>
    );
  }
  
  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };
  
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Partie pop up profil
  // State pour contrôler l'ouverture du popup
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [isNetworkPopUpOpen, setIsNetworkPopupOpen] = React.useState(false);
  const [isNetworkInfoPopUpOpen, setIsInfoNetworkPopupOpen] = React.useState(false);
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false); // État pour indiquer le chargement
  const [message, setMessage] = useState("");
  
  
  useEffect(() => {
    if (isContributor) {
      setOpen(true); // Ouvrir la pop-up au chargement de la page si "contributeur" est coché
    }
  }, [isContributor]);

  // Fonction pour ouvrir ou fermer les popup
  const togglePopupProfile = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const togglePopupFileInNetwork = () => {
    setIsNetworkPopupOpen(!isNetworkPopUpOpen);
  };

  const togglePopupNetworkInfo = () => {
    setIsInfoNetworkPopupOpen(!isNetworkInfoPopUpOpen)
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
    zIndex: 999, // S'assurer que le fond est derrière le popup
    display: isPopupOpen || isNetworkPopUpOpen  ? 'block' : 'none', // Affiche ou cache le fond
  };

  const popupStyleProfile = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Centrage
    width: '400px',
    padding: '20px',
    backgroundColor: '#343a40',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
    zIndex: 1000, // S'assurer que le popup est au-dessus de l'overlay
    display: isPopupOpen  ? 'block' : 'none', // Affiche ou cache le popup
    opacity: isPopupOpen  ? 1 : 0, // Animation de fondu
    transition: 'opacity 0.3s ease', // Effet de fondu
  };

  const popupStyleNetwork = {
    color:"white",
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Centrage
    width: '400px',
    padding: '20px',
    backgroundColor: '#343a40',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
    zIndex: 1000, // S'assurer que le popup est au-dessus de l'overlay
    display: isNetworkPopUpOpen  ? 'block' : 'none', // Affiche ou cache le popup
    opacity: isNetworkPopUpOpen  ? 1 : 0, // Animation de fondu
    transition: 'opacity 0.3s ease', // Effet de fondu
  };

  const popupStyleNetworkInfo = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Centrage
    width: '1300px',
    
    padding: '20px',
    backgroundColor: '#343a40',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
    zIndex: 1000, // S'assurer que le popup est au-dessus de l'overlay
    display: isNetworkInfoPopUpOpen ? 'block' : 'none', // Affiche ou cache le popup
    opacity: isNetworkInfoPopUpOpen ? 1 : 0, // Animation de fondu
    transition: 'opacity 0.3s ease', // Effet de fondu
  };
  
// contenu des pop ups
  const PopUpProfile = ( <>
    <p style={contentStyle3}> <AccountBoxIcon fontSize="large" /></p>
    <h2 style={contentStyle3}>IP: {ip}</h2>
    <p>Fichiers téléchargés: 2</p>
    <p>Fichiers uploads: 3</p>
    <p>Crédits: 10</p>
    <p>Recharger les Crédits</p>
    <Button variant ='contained' size='small' onClick={togglePopupProfile}>Close</Button>
    </>
  );

  const [files, setFiles] = useState([]); // État pour stocker les fichiers
  // eslint-disable-next-line
  const [error, setError] = useState(null); // État pour les erreurs
  

  const fetchFiles = async () => {
    try {
      const response = await fetch("https://5466-163-5-3-4.ngrok-free.app/list_dht",{
        headers: {
          "ngrok-skip-browser-warning": "true", // Ajouter l'en-tête ngrok
        },
      }); // API URL
      const data = await response.json();
      setIsNetworkPopupOpen(!isNetworkPopUpOpen);
      // console.log(response)
      // console.log(data)
      if (data.list_files_storage) {
        // Convertir l'objet en tableau
        const filesArray = Object.entries(data.list_files_storage);
        setFiles(filesArray); // Mettre à jour l'état avec les données récupérées
      } else {
        setError("Aucun fichier trouvé.");
      }
    } catch (err) {
      setError("Erreur lors de la récupération des fichiers.");
    }
  };
   

  const PopUpNetwork = (
    <>
       <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ marginBottom: 2, textAlign:"center" }}>
        Rechercher un Fichier dans le Réseau
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
        <SearchRoundedIcon fontSize="large" />
        {/* <Button 
          variant="contained" 
          size="small" 
          onClick={fetchFiles} 
          disabled={loading}
          sx={{ padding: "10px" }}
        >
          {loading ? "Recherche..." : "Find Files"}
        </Button> */}
      </Box>

      {/* Affichage des fichiers trouvés */}
      {loading && <CircularProgress sx={{ marginTop: 2 }} />}
      
      {/* {message && <Typography sx={{ color: "red", marginTop: 2 }}>{message}</Typography>} */}
      

      <Box
        sx={{
          maxHeight: "200px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 2,
          borderRadius: "5px",
          marginTop: 2,
        }}
      >
        <ul>
          {files.length > 0 ? (
            files.map(([fileName, fileKey], index) => (
              <li key={index}>
                <strong>{fileName}</strong>: <span>{fileKey}</span>
              </li>
            ))
          ) : (
            <li>Aucun fichier trouvé</li>
          )}
        </ul>
      </Box>

      {/* Bouton Close */}
      <Button 
        variant="contained" 
        size="small" 
        onClick={togglePopupFileInNetwork} 
        sx={{ marginTop: 2 }}
      >
        Close
      </Button>
    </Box>        </>
  );
 // eslint-disable-next-line
  const[rows,setRows] = useState([])
  

  // // eslint-disable-next-line
  const PopUpNetworkInfo = (
    <>
    <h2 textAlign='Center'>Participants présents sur le réseau </h2>
       <TableContainer component={Paper}>
      <Table sx={{ minWidth: 400 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Nodes</TableCell>
            <TableCell >Paires actifs</TableCell>
            <TableCell >DHT Local</TableCell>
            
            
          </TableRow>
        </TableHead>
        <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.my_node}</TableCell>
                      <TableCell>{JSON.stringify(row.active_peers)}</TableCell>
                      <TableCell>{JSON.stringify(row.dht_local)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
      </Table>
    </TableContainer>

      <Button
        variant="contained"
        size="small"
        onClick={togglePopupNetworkInfo}
        style={{ marginTop: '20px' }}
      >
        Close
      </Button>
    </>
  );

  // const [networkData, setNeworkData] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null); // Stocker les données du réseau

  // const handlePrint = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get("https://5466-163-5-3-4.ngrok-free.app/info");
  //     setNetworkInfo(response.data); // Stocker les données reçues
  //     // setOpen(true); // Ouvrir la popup
  //     setOpenNetworkDialog(true); // Ouvre seulement ce Dialog
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des infos réseau :", error);
  //     alert("Impossible de récupérer les informations réseau.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePrint = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://5466-163-5-3-4.ngrok-free.app/info", {
        headers: {
          "ngrok-skip-browser-warning": "true", // Ajoute cet en-tête personnalisé
        }
      });
      setNetworkInfo(response.data); // Stocker les données reçues
      setOpenNetworkDialog(true); // Ouvre seulement ce Dialog
    } catch (error) {
      console.error("Erreur lors de la récupération des infos réseau :", error);
      alert("Impossible de récupérer les informations réseau.");
    } finally {
      setLoading(false);
    }
  };
  
  

   
  // Upload
  
    const [file,setFile] = useState(null);
    
    const [openNetworkDialog, setOpenNetworkDialog] = useState(false);

    // Fonction pour gérer le changement de fichier
  const handleFileChangee = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setMessage(""); // Reset message
  };
    
    const handleUpload = async () => {
      if (!file) {
        setMessage("Veuillez sélectionner un fichier !");
        return;
      }
  
      setLoading(true);
      setMessage("Envoi en cours...");
  
      try {
        const uploadUrl = `https://5466-163-5-3-4.ngrok-free.app/upload`;
        const formData = new FormData();
        formData.append("file", file);
  
        const response = await axios.post(uploadUrl, formData, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "multipart/form-data", // Nécessaire pour l'upload de fichiers
             // Ajout de l'en-tête personnalisé pour ngrok
          },
        });
  
        // console.log("Réponse complète:", response);
  
        if (response.status === 200) {
          setMessage("✅ Upload réussi !");
        } else {
          setMessage(`⚠️ Réponse inattendue : ${response.status}`);
        }
      } catch (err) {
        console.error("Erreur lors de l'upload :", err);
        setMessage("❌ Erreur lors de l'upload !");
      }
  
      setLoading(false);
    };

  

    // Download
  
    const [filename, setFilename] = useState("")
    

    const handleDownload = async () => {
      if (!filename) {
        alert("Veuillez entrer une clé de fichier !");
        return;
      }
    
      // Trouver le nom du fichier correspondant à la clé
      const fileEntry = files.find(([fileName, fileKey]) => fileKey === filename);
    
      if (!fileEntry) {
        alert("Clé invalide ou fichier introuvable !");
        return;
      }
    
      const fileNameWithExtension = fileEntry[0]; // Nom du fichier avec extension
      const extension = `.${fileNameWithExtension.split(".").pop()}`; // Extraction de l'extension
    
      try {
        setLoading(true)
        const response = await axios.get(`https://5466-163-5-3-4.ngrok-free.app/download?file_key=${filename}`, {
          headers: {
            "ngrok-skip-browser-warning": "true", // Ajouter l'en-tête ngrok
          },
          responseType: "blob", // On attend un fichier binaire
        });
    
        console.log("Téléchargement du fichier :", fileNameWithExtension);
        console.log("Extension extraite :", extension);
    
        // Création du lien de téléchargement
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}${extension}`; // Ajout de l'extension
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

      } catch (error) {
        console.error("Erreur lors du téléchargement :", error);
        alert(error.response?.data?.error || "Une erreur est survenue");
      } finally {
        setLoading(false); // Désactivation du chargement
      }
    };
    
    

    const handleLogout = async () => {
      try {
        const response = await axios.post("http://localhost:5000/leave", { ip,
          peerPort: peerPort});
        console.log("Réponse du serveur :", response.data); } 


      catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
      } 
      
      finally {
        onLogout(); // S'exécute toujours, même en cas d'erreur
      }
    };

//Affichage app
  return (

<div className='pageStyle' style={pageStyle}>
      <h1>Bienvenue sur NodeLink !</h1>
      

       {/* Pop-up explicative */}
       <Dialog sx={{
    '& .MuiPaper-root': { 
      borderRadius: '12px', 
      padding: '20px',
      backgroundColor: '#343a40', // Fond sombre
      
    }
  }} open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{textAlign:'center',color: "#d9d9d9",fontSize: '2rem',fontWeight: 'bold',}}>Mode Contributeur Activé</DialogTitle>
        <DialogContent sx={{textAlign:'center',color: "#d9d9d9"}}>
          <p>Vous êtes en mode contributeur.</p>
          <p> Cela signifie que vous hébergez des fichiers sur le réseau.</p>
          <p>Assurez-vous d’avoir une bonne connexion et que votre pare-feu autorise les connexions entrantes.</p>
          <p>Veuillez dé-zipper le fichier que vous venez de télécharger et de démarrer le .bat afin de contribuer au réseau !</p>
          <p> Pour quitter le réseau, veuillez faire un CTRL + C pour éteindre le peer.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

  <Dialog sx={{
    '& .MuiPaper-root': { 
      borderRadius: '12px', 
      padding: '20px',
      backgroundColor: '#343a40', // Fond sombre
      
    }
  }} open={openNetworkDialog} onClose={() => setOpenNetworkDialog(false)}>
        
  <DialogTitle sx={{textAlign:'center',color: "#d9d9d9",fontSize: '2rem',fontWeight: 'bold'}}>Informations Réseau</DialogTitle>
  
  <DialogContent sx={{ textAlign: "center", color: "#d9d9d9" }}>
  {loading ? (
    <CircularProgress />
  ) : networkInfo ? (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Nombre de fichiers */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <StorageIcon sx={{ color: "#64b5f6" }} /> {/* Icône de disque */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Nombre de fichiers :
        </Typography>
        <Typography variant="h6">{networkInfo.nombre_fichier}</Typography>
      </Box>

      {/* Nombre de noeuds */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <DevicesIcon sx={{ color: "#81c784" }} /> {/* Icône d'ordinateurs */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Nombre de noeuds :
        </Typography>
        <Typography variant="h6">{networkInfo.nombre_noeud}</Typography>
      </Box>
    </Box>
  ) : (
    <Typography>Aucune information disponible</Typography>
  )}
</DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenNetworkDialog(false)} color="primary">Fermer</Button>
  </DialogActions>
</Dialog>

      {/* Header en haut à droite */}
      <div style={headerStyle} className='headerStyle'>
        {/* Premier conteneur */}
        <div style={buttonContainerStyle} className='buttonContainerStyle'>
          {/* Bouton pour ouvrir la pop-up */}
          <Button variant="contained" size="large" onClick= {fetchFiles}  sx={{ color: '#d9d9d9', fontWeight: 'bold', background: '#343a40' }}> Fichier dans le réseau </Button>
          {/* Afficher la pop-up si isNetworkPopUpOpen est vrai */}
          <Button variant="contained" size="large" onClick={handlePrint} sx={{ color: '#d9d9d9', fontWeight: "bold", background: "#343a40" }} disabled={loading}> {loading ? "Chargement..." : "Informations Réseau"} </Button>
          
        </div>
        {/* Deuxième conteneur */}
        <div style={buttonContainerStyle} className='buttonContainerStyle'>
          <Button variant ='contained' size = 'large' onClick={togglePopupProfile} sx={{color:'#d9d9d9', fontWeight:"bold",background: "#343a40"}}>Profil</Button>
          <Button variant="text" size = 'large' sx={{color:'#d9d9d9', fontWeight:"bold"}} onClick={handleLogout}>Déconnexion</Button>
          
        </div>
      </div>

      {/* Contenu dans l'encadré a gauche */}
      <div style={contentContainerStyle} className='contentContainerStyle'>
        <p >

            <Box  sx={{ borderBottom: 1, borderColor: 'divider',display: 'flex', alignItems: 'flex-end' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                  <Tab label="Upload" {...a11yProps(0)} sx={{color:"#d9d9d9"}} />
                  <Tab label="Download" {...a11yProps(1)} sx={{color:"#d9d9d9"}} />
                </Tabs>
              </Box>

              <CustomTabPanel value={value} index={0}>
              <h1 style = {contentStyle2} className='contentStyle2'>Charger des Fichiers</h1>
              <p style ={contentStyle} className='contentStyle'>
             
{/* 
            <div>
              <input type="file" onChange={handleFileChangee} style={{ display: "none" }} id="file-input" />
              <label htmlFor="file-input">
                <Button  component="span" size="large" variant="contained" startIcon={<CloudUploadIcon />}>
                  Choisir un fichier
                </Button>
              </label>

              {file && <p >Fichier sélectionné : {file.name}</p>}

              <Button variant="contained" color="primary" onClick={handleUpload} disabled={loading}>
                {loading ? "Envoi..." : "Uploader"}
              </Button>

              {loading && <CircularProgress style={{ marginTop: "10px" }} />}

              {message && <p style={contentStyle2}>{message}</p>}
            </div> */}

<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <input 
        type="file" 
        onChange={handleFileChangee} 
        style={{ display: "none" }} 
        id="file-input" 
      />
      <label htmlFor="file-input">
        <Button 
          component="span" 
          size="large" 
          variant="contained" 
          startIcon={<CloudUploadIcon />} 
          sx={{ width: 200 }}  // Optionnel : ajuster la taille du bouton
        >
          Choisir un fichier
        </Button>
      </label>

      {file && (
        <Typography variant="body1" sx={{ margin: '10px ',color:"#d9d9d9"  }}>
          Fichier sélectionné : {file.name}
        </Typography>
      )}

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleUpload} 
        disabled={loading} 
        sx={{ width: 200,color:"#d9d9d9" }}  // Optionnel : ajuster la taille du bouton
      >
        {loading ? "Envoi..." : "Uploader"}
      </Button>

      {loading && <CircularProgress sx={{ marginTop: '10px' }} />}

      {message && <Typography variant="body2" sx={{ marginTop: '10px', color: 'white' }}>{message}</Typography>}
    </Box>

              </p> 
              </CustomTabPanel>

              {/* <CustomTabPanel value={value} index={1}> 
  <h1 style={contentStyle2}>Télécharger des Fichiers</h1>
  <ThemeProvider theme={theme}>
    <TextField
      id="standard-basic"
      label="Entrez la clé du fichier"
      variant="standard"
      value={filename}
      onChange={(e) => setFilename(e.target.value)}
    />
  </ThemeProvider>
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <Button component="span" size="large" variant="contained" onClick={handleDownload} disabled={loading}>
      {loading ? "Téléchargement..." : "Télécharger"}
    </Button>
    {loading && <CircularProgress size={24} />}
  </div>
</CustomTabPanel> */}
<CustomTabPanel value={value} index={1}> 
<h1 style={contentStyle2}>Télécharger des Fichiers</h1>
      
      <ThemeProvider theme={theme}>
        <TextField
          id="standard-basic"
          label="Entrez la clé du fichier"
          variant="standard"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          fullWidth
          sx={{ marginBottom: 2 }}  // Ajout d'une marge en bas du TextField
        />
      </ThemeProvider>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button 
          component="span" 
          size="large" 
          variant="contained" 
          onClick={handleDownload} 
          disabled={loading} 
          sx={{ width: 200 }} // Largeur du bouton pour plus de consistance
        >
          {loading ? "Téléchargement..." : "Télécharger"}
        </Button>
        
        {loading && <CircularProgress size={24} />}
      </Box>
    </CustomTabPanel>
              </p> </div>

    {/* Overlay qui assombrit le fond */}
    <div style={overlayStyle} onClick={(event)=> { 
      
      if (isPopupOpen) {
      setIsPopupOpen(false);
    }
    if (isNetworkPopUpOpen) {
      setIsNetworkPopupOpen(false);
    }}} />

    {/* Popup Profile*/}
    <div style={popupStyleProfile}>
      {PopUpProfile}
    </div>

    {/* Popup File in network*/}
    <div style={popupStyleNetwork}>
      {PopUpNetwork}
    </div>

    {/* Popup Network Info */}
    <div style={popupStyleNetworkInfo}>
      {PopUpNetworkInfo}
    </div>

</div>
  );
};

export default Page;
