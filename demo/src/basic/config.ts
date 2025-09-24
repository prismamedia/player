import './main.css'
import PrismaPlayer from '@prismamedia/player'

const prismaPlayer = new PrismaPlayer(document.querySelector('#playerWrapper-1') as HTMLElement)
prismaPlayer.init()
