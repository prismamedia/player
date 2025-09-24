import type {
	AdPosition,
	AdsCore,
	DailymotionPlayerInstance,
	DailymotionPlayerInstanceState,
	Player
} from './types'

export default class DailymotionPlayer {
	playerWrapper: HTMLElement
	player: Player

	constructor(element: HTMLElement) {
		this.playerWrapper = element
		this.player = {
			adsCore: JSON.parse(element.getAttribute('data-ads-core') ?? ''),
			instance: null,
			reboundCount: 0,
			adCallCounter: 0,
			prerollPosition: 1 // Start at 1 for CoreAds
		}
	}

	async init() {
		await this.loadScript()

		Promise.all([
			this.createPlayer(),
			this.getAdParams({
				adPosition: 'preroll'
			})
		]).then(([, adsCustomConfig]) => {
			if (adsCustomConfig) {
				this.player.instance?.setCustomConfig({
					adurl: adsCustomConfig
				})
			}
		})
	}

	/**
	 * Load Dailymotion SDK
	 * https://developers.dailymotion.com/sdk/player-sdk/web
	 * @returns SDK is loaded
	 */
	async loadScript(): Promise<void> {
		return new Promise((resolve) => {
			if (typeof window.dailymotion !== 'undefined') {
				resolve()
			} else {
				const script = document.createElement('script')
				script.defer = true
				script.src = `https://geo.dailymotion.com/libs/player/${this.player.adsCore.playerId}.js`
				script.onload = () => resolve()
				document.head.appendChild(script)
			}
		})
	}

	/**
	 * Create player
	 */
	async createPlayer() {
		const playerElement = this.playerWrapper.firstElementChild as HTMLElement
		this.player.instance = await window.dailymotion.createPlayer(
			playerElement.getAttribute('id') as string,
			{
				video: this.player.adsCore.playerVideoId,
				player: this.player.adsCore.playerId,
				referrerPolicy: 'no-referrer-when-downgrade',
				params: {
					mute: true
				}
			}
		)
		this.addEvents()
	}

	/**
	 * Add events
	 */
	addEvents() {
		const playerInstance = this.player.instance as DailymotionPlayerInstance

		playerInstance.on(
			window.dailymotion.events.AD_READYTOFETCH,
			async ({ adPosition, adBreakId }: DailymotionPlayerInstanceState) => {
				if (
					adPosition === 'preroll' &&
					(this.player.adCallCounter !== 0 || adBreakId === 'preroll2')
				) {
					const adParams = await this.getAdParams({
						adPosition
					})
					playerInstance.setCustomConfig({
						adurl: adParams
					})
				}
			}
		)

		// Video rebound count is incremented when the video start
		playerInstance.on(window.dailymotion.events.VIDEO_START, () => {
			this.player.reboundCount++
		})

		// Preroll position is reset to its default value on video change
		playerInstance.on(window.dailymotion.events.PLAYER_VIDEOCHANGE, () => {
			this.player.prerollPosition = 1
		})
	}

	/**
	 * Get ad params from CoreAds
	 * @param {object} params
	 * @param {'Leader'|'Widget'|'Autres'} params.adPosition Ad position
	 * @returns Ad url
	 */
	async getAdParams({ adPosition }: { adPosition: AdPosition }): Promise<string> {
		return new Promise((resolve) => {
			window.coreAds.queue.push(async () => {
				const adParams = await window.coreAds.getVideoSlotParameters({
					htmlPlacerId: this.playerWrapper.getAttribute('id') as string,
					reboundCount: this.player.reboundCount,
					preroll_position: this.player.prerollPosition,
					adPosition,
					adRequestUrl: true
				})
				this.player.prerollPosition++
				this.player.adCallCounter++
				resolve(adParams)
			})
		})
	}
}
