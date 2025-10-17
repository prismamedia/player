export type AdsCore = {
	playerVideoId: string
	playerPosition: string
	playerId: string
}

export type DailymotionPlayerOptionParams = {
	mute?: boolean
    [key: string]: any
}

export type DailymotionPlayerInstance = {
	on: (event: string, callback: any, parameters?: string[]) => void
	off: (event: string, callback?: any) => void
	play: () => void
	setCustomConfig: (customConfig: { adurl?: string }) => void
    setVolume: (volume: number) => void
}

export type Player = {
	element: HTMLElement
	adsCore: AdsCore
	instance: DailymotionPlayerInstance | null
	reboundCount: number
	adCallCounter: number
	prerollPosition: number
}

export type AdPosition = 'preroll'

export type DailymotionPlayerInstanceState = {
	adPosition: AdPosition
	adBreakId: string
}

export type DailymotionCreatePlayerParams = {
	video: string
	player: string
	referrerPolicy: string
	params: {
		mute?: boolean
	}
}

declare global {
	interface Window {
		dailymotion: {
			createPlayer: (
				selectorId: string,
				options: DailymotionCreatePlayerParams
			) => Promise<DailymotionPlayerInstance>
			events: {
				AD_READYTOFETCH: string
				PLAYER_VIDEOCHANGE: string
				VIDEO_START: string
			}
		}
		coreAds: {
			getVideoSlotParameters: ({
				htmlPlacerId,
				reboundCount,
				adPosition,
				adRequestUrl,
				preroll_position
			}: {
				htmlPlacerId: string
				reboundCount?: number
				adPosition?: string
				adRequestUrl?: boolean
				preroll_position?: number
			}) => Promise<string>
			queue: {
				push: (callback: () => void) => void
			}
		}
	}
}
