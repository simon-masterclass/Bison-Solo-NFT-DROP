import { useState, useEffect } from 'react'
import { Row, Col, Spinner } from 'react-bootstrap'
import Countdown from 'react-countdown'
import Web3 from 'web3'

// Import Images + CSS
import twitter from '../images/socials/twitter.svg'
import instagram from '../images/socials/instagram.svg'
import opensea from '../images/socials/opensea.svg'
import showcase from '../images/showcase.png'
import '../App.css'

// Import Components
import Navbar from './Navbar'

// Import ABI + Config
import BisonSolo from '../abis/BisonSolo.json'
import config from '../config.json'

function App() {
	const [web3, setWeb3] = useState(null)
	const [bisonSolo, setBisonSolo] = useState(null)

	const [supplyAvailable, setSupplyAvailable] = useState(0)

	const [account, setAccount] = useState(null)
	const [networkId, setNetworkId] = useState(null)
	const [ownerOf, setOwnerOf] = useState([])

	const [explorerURL, setExplorerURL] = useState('https://goerli.etherscan.io')
	const [openseaURL, setOpenseaURL] = useState('https://testnets-api.opensea.io/api/v1')

	const [isMinting, setIsMinting] = useState(false)
	const [isError, setIsError] = useState(false)
	const [message, setMessage] = useState(null)

	const [currentTime, setCurrentTime] = useState(new Date().getTime())
	const [revealTime, setRevealTime] = useState(0)

	const [counter, setCounter] = useState(7)
	const [priceNFT, setPriceNFT] = useState(0)
	const [isCycling, setIsCycling] = useState(false)
	const [numberOfNFTs, setNumberOfNFTs] = useState(1)

	const loadBlockchainData = async (_web3, _account, _networkId) => {
		// Fetch Contract, Data, etc.
		try {
			const bisonSolo = new _web3.eth.Contract(BisonSolo.abi, BisonSolo.networks[_networkId].address)
			setBisonSolo(bisonSolo)

			const maxSupply = await bisonSolo.methods.maxSupply().call()
			const totalSupply = await bisonSolo.methods.totalSupply().call()
			setSupplyAvailable(maxSupply - totalSupply)

			const allowMintingAfter = await bisonSolo.methods.allowMintingAfter().call()
			const timeDeployed = await bisonSolo.methods.timeDeployed().call()
			const price = await bisonSolo.methods.cost().call()
			setPriceNFT(price)


			setRevealTime((Number(timeDeployed) + Number(allowMintingAfter)).toString() + '000')

			if (_account) {
				const ownerOf = await bisonSolo.methods.walletOfOwner(_account).call()
				setOwnerOf(ownerOf)
			} else {
				setOwnerOf([])
			}

		} catch (error) {
			//console.log(error.message.toString())
			setIsError(true)
			setMessage("Contract not deployed to current network, please change network in MetaMask")
		}
	}

	const loadWeb3 = async () => {
		if (typeof window.ethereum !== 'undefined') {
			const web3 = new Web3(window.ethereum)
			setWeb3(web3)

			const accounts = await web3.eth.getAccounts()

			if (accounts.length > 0) {
				setAccount(accounts[0])
			} else {
				setMessage('Please connect with MetaMask')
			}

			const networkId = await web3.eth.net.getId()
			setNetworkId(networkId)

			if (networkId !== 5777) {
				setExplorerURL(config.NETWORKS[networkId].explorerURL)
				setOpenseaURL(config.NETWORKS[networkId].openseaURL)
			}

			await loadBlockchainData(web3, accounts[0], networkId)

			window.ethereum.on('accountsChanged', function (accounts) {
				setAccount(accounts[0])
				setMessage(null)
			})

			window.ethereum.on('chainChanged', (chainId) => {
				// Handle the new chain.
				// Correctly handling chain changes can be complicated.
				// We recommend reloading the page unless you have good reason not to.
				window.location.reload();
			})
		}
	}

	const incrementMinus = () => {
		if (numberOfNFTs <= 1) return
		setNumberOfNFTs(numberOfNFTs - 1)
	}
	
	const incrementPlus = () => {
		if (numberOfNFTs >= 3) return
		setNumberOfNFTs(numberOfNFTs + 1)
	}
	
	// MetaMask Login/Connect
	const web3Handler = async () => {
		if (web3) {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			setAccount(accounts[0])
		}
	}

	const mintNFTHandler = async () => {
		if (revealTime > new Date().getTime()) {
			window.alert('Minting is not live yet!')
			return
		}

		if (ownerOf.length > 3) {
			window.alert('You\'ve already minted 3 times, that\'s the max!')
			return
		}

		// Mint NFT
		if (bisonSolo && account) {
			setIsMinting(true)
			setIsError(false)
			

			await bisonSolo.methods.mint(numberOfNFTs).send({ from: account, value: priceNFT })
				.on('confirmation', async () => {
					const maxSupply = await bisonSolo.methods.maxSupply().call()
					const totalSupply = await bisonSolo.methods.totalSupply().call()
					setSupplyAvailable(maxSupply - totalSupply)

					const ownerOf = await bisonSolo.methods.walletOfOwner(account).call()
					setOwnerOf(ownerOf)
				})
				.on('error', (error) => {
					window.alert(error)
					setIsError(true)
				})
		}

		setIsMinting(false)
	}

	const cycleImages = async () => {
		const getRandomNumber = () => {
			const counter = (Math.floor(Math.random() * 23)) + 1
			setCounter(counter)
		}

		if (!isCycling) { setInterval(getRandomNumber, 3000) }
		setIsCycling(true)
	}

	useEffect(() => {
		loadWeb3()
		cycleImages()
	}, [account]);

	return (
		<div>
			<Navbar web3Handler={web3Handler} account={account} explorerURL={explorerURL} />
			<main>
				<section id='welcome' className='welcome'>

					<Row className='header my-3 p-3 mb-0 pb-0'>
						<Col xs={12} md={12} lg={8} xxl={8}>
							<h1>Bison Solo</h1>
							<p className='sub-header'>Dropping on <br />12 / 20 / 22</p>
						</Col>
						<Col className='flex social-icons'>
							<a
								href="https://twitter.com/zeroarmy_org"
								target='_blank'
								className='circle flex button'>
								<img src={twitter} alt="Twitter" />
							</a>
							<a
								href="https://www.instagram.com/zeroarmy_org/"
								target='_blank'
								className='circle flex button'>
								<img src={instagram} alt="Instagram" />
							</a>
							<a
								href={`${openseaURL}/collection/${config.PROJECT_NAME}`}
								target='_blank'
								className='circle flex button'>
								<img src={opensea} alt="Opensea" />
							</a>
						</Col>
					</Row>

					<Row className='flex m-3'>
						<Col md={5} lg={4} xl={5} xxl={4} className='text-center'>
							<img
								src={require(`../images/Bison-pics/${counter}.png`)} //https://ipfs.io/ipfs/QmNRCSyKy8F2MCmt4V97RDeGMxKP2ueHoeX1owTpXPXRxw
								alt="Bison Solo"
								className='showcase'
							/>
						</Col>
						<Col md={5} lg={4} xl={5} xxl={4}>
							{(revealTime - currentTime) > 0 && revealTime !== 0 && <Countdown date={currentTime + (revealTime - currentTime)} className='countdown mx-3' />}
							<p className='text'>
							The Bison Solo NFT collection is a rare, one of a kind AI rendered artwork from the mind of Eduard Smirnov. Each Bison NFT comes with a special gift. Visit 
							<a href="#about">www.bison.solo</a> for details.
							</p>
							<a href="#about" className='button mx-3'>Learn More!</a>
						</Col>
					</Row>

				</section>
				<section id='about' className='about'>

					<Row className='flex m-3'>
						<h2 className='text-center p-3'>About the Collection</h2>
						<Col md={5} lg={4} xl={5} xxl={4} className='text-center'>
							<img src={showcase} alt="Solo Bison" className='showcase' />
						</Col>
						<Col md={5} lg={4} xl={5} xxl={4}>
							{isError ? (
								<p>{message}</p>
							) : (
								<div>
									{(revealTime - currentTime) < 0 ? (<h3>Mint your Bison Solo NFT now!</h3>
									):( 
										<><h3>Mint your NFT in</h3>
										{revealTime !== 0 && <Countdown date={currentTime + (revealTime - currentTime)} className='countdown' />}
										</>
									)}
									<ul>
										<li>25 generated bisons using Artificial Intelligence</li>
										<li>Free minting on Goerli testnet</li>
										<li>Viewable on Opensea shortly after minting</li>
										{/* <li>Price per NFT: {priceNFT/1000000000000000000 || 0.000111} ETH</li> */}
										<li>Max Mint Amount: 3 NFTs</li>
									</ul>
										
									<div className='plusminusbuttons'>
										<h3>How many NFTs would you like to mint?</h3>
										<h5>
										<button onClick={incrementMinus} className='increment-button mt-1'>-</button>
											{' '}{numberOfNFTs}{' '} 
										<button onClick={incrementPlus} className='increment-button mt-1'>+</button>
										</h5>
										<p></p>
									</div>

										<h3>TOTAL: {(priceNFT/1000000000000000000)*numberOfNFTs || 0.000111*numberOfNFTs} ETH</h3>
										<br/>
									
									{isMinting ? (
										<Spinner animation="border" className='p-3 m-2' />
									) : (
										<button onClick={mintNFTHandler} className='button mint-button mt-3'>Mint</button>
									)}

									{ownerOf.length > 0 &&
										<p><small>View your NFT on
											<a
												href={`${openseaURL}/assets/${bisonSolo._address}/${ownerOf[0]}`}
												target='_blank'
												style={{ display: 'inline-block', marginLeft: '3px' }}>
												OpenSea
											</a>
										</small></p>}
								</div>
							)}
						</Col>
					</Row>

					<Row style={{ marginTop: "100px" }}>
						<Col>
							{bisonSolo &&
								<a
									href={`${explorerURL}/address/${bisonSolo._address}`}
									target='_blank'
									className='text-center'>
									{bisonSolo._address}
								</a>
							}
						</Col>
					</Row>

				</section>
			</main>
			<footer>

			</footer>
		</div>
	)
}

export default App
