import PrismaPlayer from '@src/index'

const getInstance = () => new PrismaPlayer(document.querySelector('#playerWrapper-1'))

const getDailymotionMock = () => {
	Object.defineProperty(window, 'dailymotion', {
		writable: true,
		value: {
			createPlayer: jest.fn().mockResolvedValue({
				setVolume: jest.fn()
			}),
			events: {
				PLAYER_VIDEOCHANGE: 'videochange',
				VIDEO_START: 'video_start',
				AD_READYTOFETCH: 'ad_readytofetch'
			}
		}
	})
}

let prismaPlayer

describe('PrismaPlayer', () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<div
				id="playerWrapper-1"
				data-ads-core='{
					"playerVideoId": "k4TUcxu2wZBNIyyyl5p",
					"playerPosition": "Leader",
					"playerId": "x168nc"
				}'
			>
				<div id="player-1"></div>
			</div>
		`

		prismaPlayer = getInstance()
	})

	afterEach(() => {
		window.dailymotion = undefined
		jest.clearAllMocks()
		jest.restoreAllMocks()
	})

	describe('constructor', () => {
		it('should set default variables as properties', () => {
			expect(prismaPlayer.player).toStrictEqual({
				element: document.querySelector('#playerWrapper-1'),
				adsCore: {
					playerVideoId: 'k4TUcxu2wZBNIyyyl5p',
					playerPosition: 'Leader',
					playerId: 'x168nc'
				},
				instance: null,
				reboundCount: 0,
				adCallCounter: 0,
				prerollPosition: 1
			})
		})

		it('should set default variables as properties without data-ads-core attribute', () => {
			document.querySelector('#playerWrapper-1').removeAttribute('data-ads-core')

			const customPrismaPlayer = new PrismaPlayer(document.querySelector('#playerWrapper-1'))

			expect(customPrismaPlayer.player).toStrictEqual({
				element: document.querySelector('#playerWrapper-1'),
				adsCore: null,
				instance: null,
				reboundCount: 0,
				adCallCounter: 0,
				prerollPosition: 1
			})
		})
	})

	describe('init', () => {
		beforeEach(() => {
			prismaPlayer.loadScript = jest.fn()
			prismaPlayer.createPlayer = jest.fn().mockResolvedValue(undefined)
			prismaPlayer.player.instance = {
				setCustomConfig: jest.fn()
			}
			prismaPlayer.player.element.dispatchEvent = jest.fn()
			window.CustomEvent = jest.fn()
		})

		afterEach(() => {
			expect(prismaPlayer.loadScript).toHaveBeenCalled()
			expect(prismaPlayer.createPlayer).toHaveBeenCalled()
			expect(prismaPlayer.getAdParams).toHaveBeenCalledWith({
				adPosition: 'preroll'
			})
		})

		it('should call the init function', async () => {
			prismaPlayer.getAdParams = jest.fn().mockResolvedValue('ads')

			expect.assertions(6)
			await prismaPlayer.init()

			expect(prismaPlayer.player.instance.setCustomConfig).toHaveBeenCalledWith({ adurl: 'ads' })
			expect(prismaPlayer.player.element.dispatchEvent).toHaveBeenCalled()
			expect(window.CustomEvent).toHaveBeenCalledWith('prismaPlayerReady', {
				detail: {
					instance: {
						setCustomConfig: expect.any(Function)
					}
				}
			})
		})

		it('should call the init function without adsCustomConfig', async () => {
			prismaPlayer.getAdParams = jest.fn().mockResolvedValue(undefined)

			expect.assertions(6)
			await prismaPlayer.init()

			expect(prismaPlayer.player.instance.setCustomConfig).not.toHaveBeenCalled()
			expect(prismaPlayer.player.element.dispatchEvent).toHaveBeenCalled()
			expect(window.CustomEvent).toHaveBeenCalledWith('prismaPlayerReady', {
				detail: {
					instance: {
						setCustomConfig: expect.any(Function)
					}
				}
			})
		})
	})

	describe('loadScript', () => {
		let script

		beforeEach(() => {
			script = document.createElement('script')
			// https://stackoverflow.com/a/47273783
			Object.defineProperty(script, 'onload', {
				set: (fn) => {
					this._onload = fn()
				}
			})
			jest.spyOn(document, 'createElement').mockReturnValue(script)
			document.head.appendChild = jest.fn()
		})

		it('should call the loadScript function if SDK is not already loaded', async () => {
			expect.assertions(4)
			const result = await prismaPlayer.loadScript()

			expect(result).toBeUndefined() // Testing that Promise has resolved to undefined
			expect(script.defer).toBe(true)
			expect(script.src).toBe(
				`https://geo.dailymotion.com/libs/player/${prismaPlayer.player.adsCore.playerId}.js`
			)
			expect(document.head.appendChild).toHaveBeenCalledWith(script)
		})

		it('should call the loadScript function if SDK is already loaded', async () => {
			window.dailymotion = {}

			expect.assertions(2)
			const result = await prismaPlayer.loadScript()

			expect(result).toBeUndefined() // Testing that Promise has resolved to undefined
			expect(document.head.appendChild).not.toHaveBeenCalled()
		})
	})

	describe('createPlayer', () => {
		beforeEach(() => {
			getDailymotionMock()
			prismaPlayer.addEvents = jest.fn()
		})

		afterEach(() => {
			expect(window.dailymotion.createPlayer).toHaveBeenCalledWith('player-1', {
				video: prismaPlayer.player.adsCore.playerVideoId,
				player: prismaPlayer.player.adsCore.playerId,
				referrerPolicy: 'no-referrer-when-downgrade',
				params: prismaPlayer.playerParams
			})
			expect(prismaPlayer.addEvents).toHaveBeenCalled()
		})

		it('should call the createPlayer function', async () => {
			expect.assertions(3)
			await prismaPlayer.createPlayer()

			expect(prismaPlayer.player.instance.setVolume).toHaveBeenCalledWith(prismaPlayer.leaderVolume)
		})

		it('should call the createPlayer function with player type not a leader', async () => {
			prismaPlayer.player.adsCore.playerPosition = 'widget'

			expect.assertions(3)
			await prismaPlayer.createPlayer()

			expect(prismaPlayer.player.instance.setVolume).not.toHaveBeenCalled()
		})
	})

	describe('addEvents', () => {
		it('should call the addEvents function', async () => {
			getDailymotionMock()
			prismaPlayer.player.instance = {
				on: jest.fn()
			}
			prismaPlayer.onAdReadyToFetch = jest.fn()
			prismaPlayer.onVideoStart = jest.fn()
			prismaPlayer.onPlayerVideoChange = jest.fn()

			await prismaPlayer.addEvents()

			expect(prismaPlayer.player.instance.on).toHaveBeenNthCalledWith(
				1,
				window.dailymotion.events.AD_READYTOFETCH,
				expect.any(Function)
			)
			expect(prismaPlayer.player.instance.on).toHaveBeenNthCalledWith(
				2,
				window.dailymotion.events.VIDEO_START,
				expect.any(Function)
			)
			expect(prismaPlayer.player.instance.on).toHaveBeenNthCalledWith(
				3,
				window.dailymotion.events.PLAYER_VIDEOCHANGE,
				expect.any(Function)
			)

			// Call mocks to test function parameters
			prismaPlayer.player.instance.on.mock.calls[0][1]()
			expect(prismaPlayer.onAdReadyToFetch).toHaveBeenCalled()
			prismaPlayer.player.instance.on.mock.calls[1][1]()
			expect(prismaPlayer.onVideoStart).toHaveBeenCalled()
			prismaPlayer.player.instance.on.mock.calls[2][1]()
			expect(prismaPlayer.onPlayerVideoChange).toHaveBeenCalled()
		})
	})

	describe('onAdReadyToFetch', () => {
		beforeEach(() => {
			prismaPlayer.player.instance = {
				setCustomConfig: jest.fn()
			}
			prismaPlayer.getAdParams = jest.fn().mockResolvedValue('adsparams')
			prismaPlayer.player.instance.setCustomConfig = jest.fn()
		})

		it('should call the onAdReadyToFetch function with TRUE && TRUE || TRUE', async () => {
			expect.assertions(2)
			await prismaPlayer.onAdReadyToFetch({ adPosition: 'preroll', adBreakId: 'preroll2' })

			expect(prismaPlayer.getAdParams).toHaveBeenCalledWith({ adPosition: 'preroll' })
			expect(prismaPlayer.player.instance.setCustomConfig).toHaveBeenCalledWith({
				adurl: 'adsparams'
			})
		})

		it('should call the onAdReadyToFetch function with FALSE && TRUE || TRUE', async () => {
			expect.assertions(2)
			await prismaPlayer.onAdReadyToFetch({ adPosition: 'postroll', adBreakId: 'preroll2' })

			expect(prismaPlayer.getAdParams).not.toHaveBeenCalled()
			expect(prismaPlayer.player.instance.setCustomConfig).not.toHaveBeenCalled()
		})

		it('should call the onAdReadyToFetch function with TRUE && FALSE || FALSE ', async () => {
			prismaPlayer.player.adCallCounter = 0
			expect.assertions(2)
			await prismaPlayer.onAdReadyToFetch({ adPosition: 'preroll', adBreakId: 'preroll' })

			expect(prismaPlayer.getAdParams).not.toHaveBeenCalled()
			expect(prismaPlayer.player.instance.setCustomConfig).not.toHaveBeenCalled()
		})

		it('should call the onAdReadyToFetch function with TRUE && TRUE || FALSE ', async () => {
			prismaPlayer.player.adCallCounter = 1
			expect.assertions(2)
			await prismaPlayer.onAdReadyToFetch({ adPosition: 'preroll', adBreakId: 'preroll' })

			expect(prismaPlayer.getAdParams).toHaveBeenCalledWith({ adPosition: 'preroll' })
			expect(prismaPlayer.player.instance.setCustomConfig).toHaveBeenCalledWith({
				adurl: 'adsparams'
			})
		})

		it('should call the onAdReadyToFetch function with TRUE && FALSE || TRUE ', async () => {
			expect.assertions(2)
			await prismaPlayer.onAdReadyToFetch({ adPosition: 'preroll', adBreakId: 'preroll2' })

			expect(prismaPlayer.getAdParams).toHaveBeenCalledWith({ adPosition: 'preroll' })
			expect(prismaPlayer.player.instance.setCustomConfig).toHaveBeenCalledWith({
				adurl: 'adsparams'
			})
		})
	})

	describe('onVideoStart', () => {
		it('should call the onVideoStart function', async () => {
			prismaPlayer.onVideoStart()

			expect(prismaPlayer.player.reboundCount).toStrictEqual(1)
		})
	})

	describe('onPlayerVideoChange', () => {
		it('should call the onPlayerVideoChange function', async () => {
			prismaPlayer.onPlayerVideoChange()

			expect(prismaPlayer.player.prerollPosition).toStrictEqual(1)
		})
	})

	describe('getAdParams', () => {
		it('should call the getAdParams function', async () => {
			Object.defineProperty(window, 'coreAds', {
				writable: true,
				value: {
					getVideoSlotParameters: jest.fn(),
					queue: []
				}
			})
			// Simulate CoreAds queue execution
			const coreAdsQueueInterval = setInterval(() => {
				if (window.coreAds.queue.length && window.coreAds.queue[0] instanceof Function) {
					clearInterval(coreAdsQueueInterval)
					window.coreAds.queue[0]()
				}
			}, 500)

			window.coreAds.getVideoSlotParameters = jest.fn().mockReturnValue('adsurl')

			expect.assertions(3)
			const result = await prismaPlayer.getAdParams({ adPosition: 'preroll' })

			expect(window.coreAds.queue.length).toStrictEqual(1)
			expect(window.coreAds.getVideoSlotParameters).toHaveBeenCalledWith({
				htmlPlacerId: 'playerWrapper-1',
				reboundCount: 0,
				preroll_position: 1,
				adPosition: 'preroll',
				adRequestUrl: true
			})
			expect(result).toStrictEqual('adsurl')
		})
	})
})
