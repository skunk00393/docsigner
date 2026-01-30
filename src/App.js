import React, { useState, useEffect } from "react";
import {
  initializeContract,
  connectWallet,
  signDocument,
  fetchDocumentByHash,
  fetchDocumentByName,
} from "./contractFunctions";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  TextField,
} from "@mui/material";
import { addPdfLogoWatermark } from "./watermark";

function App() {
  const [account, setAccount] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [documentDetails, setDocumentDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeContract();
  }, []);

  const handleConnectWallet = async () => {
    const walletAccount = await connectWallet();
    setAccount(walletAccount);
  };

  const hashFile = async (file) => {
    setLoading(true);
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    setFileHash(hashHex);
    setDocumentName(file.name);

    await signDocument(hashHex, file.name);
    setLoading(false);
    downloadFile(file)
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      hashFile(uploadedFile);
    }
  };

  const handleSearchByHash = async () => {
    if (!searchQuery) return;
    const details = await fetchDocumentByHash(searchQuery);
    setDocumentDetails(details);
  };

  const handleSearchByName = async () => {
    if (!searchQuery) return;
    const details = await fetchDocumentByName(searchQuery);
    setDocumentDetails(details);
  };

  const downloadFile = async (file) => {
    const blob = await addPdfLogoWatermark(
      file,
      `File hash: ${fileHash}`,
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const splitFileName = file.name.split('.')
    a.download = `${splitFileName[0]}-signed.${splitFileName[1]}`;
    a.click();
  };

  return (
    <Container>
      <Paper
        elevation={3}
        sx={{ padding: 4, marginTop: 5, textAlign: "center" }}
      >
        <Typography variant="h4" gutterBottom>
          Document Signing DApp
        </Typography>

        <Button
          variant="contained"
          onClick={handleConnectWallet}
          sx={{ width: "500px" }}
        >
          {account ? `Connected: ${account}` : "Connect Wallet"}
        </Button>

        {account && (
          <Box
            sx={{
              marginTop: 3,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Upload a Document</Typography>
            <Button
              variant="contained"
              component="label"
              sx={{ width: "200px" }}
            >
              Choose File
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={handleFileUpload}
              />
            </Button>

            {loading ? (
              <CircularProgress />
            ) : (
              fileHash && (
                <Box sx={{ textAlign: "left", marginTop: 2 }}>
                  <Typography variant="body1">
                    <b>File Name:</b> {documentName}
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                    <b>File Hash:</b> {fileHash}
                  </Typography>
                </Box>
              )
            )}

            <Typography variant="h6" sx={{ marginTop: 3 }}>
              Search Document
            </Typography>

            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ marginBottom: 2, width: "500px" }}
            />
            <Box sx={{ display: "flex", gap: "8px" }}>
              <Button variant="contained" onClick={handleSearchByHash}>
                Search by Hash
              </Button>

              <Button variant="contained" onClick={handleSearchByName}>
                Search by Name
              </Button>
            </Box>
            {documentDetails && (
              <Paper
                elevation={2}
                sx={{ padding: 2, marginTop: 3, textAlign: "left" }}
              >
                <Typography variant="h6">Document Details</Typography>
                <Typography>
                  <b>Document Hash:</b> {documentDetails[0]}
                </Typography>
                <Typography>
                  <b>Document Name:</b> {documentDetails[1]}
                </Typography>
                <Typography>
                  <b>Signer Address:</b> {documentDetails[2]}
                </Typography>
                <Typography>
                  <b>Signed At:</b>{" "}
                  {new Date(Number(documentDetails[3]) * 1000).toLocaleString()}
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App;
