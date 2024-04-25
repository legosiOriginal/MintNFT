
window.addEventListener('load', async () => {
    // Connect to the Ethereum network
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
        return;
    }

    // Load the smart contract
    const contractAddress = 'YOUR_CONTRACT_ADDRESS';
    const contractABI = [/* YOUR_CONTRACT_ABI */];
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Handle form submission
    const form = document.getElementById('mintForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const image = document.getElementById('image').files[0];

        const reader = new FileReader();
        reader.onloadend = async () => {
            const ipfs = window.IpfsHttpClient('localhost', '5001');
            const ipfsResult = await ipfs.add(reader.result);
            const ipfsImageUrl = `https://ipfs.io/ipfs/${ipfsResult.path}`;

            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];

            const gas = await contract.methods.mint.estimateGas(name, description, ipfsImageUrl);
            const result = await contract.methods.mint(name, description, ipfsImageUrl)
                .send({ from: account, gas });

            document.getElementById('result').innerHTML = `Transaction hash: ${result.transactionHash}`;
        };

        reader.readAsArrayBuffer(image);
    });
});
