import PrismaPlayer from '@src/index'

const getInstance = () => new PrismaPlayer(document.querySelector('#playerWrapper-1'))

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
	})
})
