import './main.css'
import PrismaPlayer from '@prismamedia/player'

const element = document.querySelector('#playerWrapper-1') as HTMLElement

element.addEventListener('prismaPlayerReady', (e: any) => {
	console.log('Player is ready', e.detail.instance)
})

const prismaPlayer = new PrismaPlayer(element)
prismaPlayer.init()
