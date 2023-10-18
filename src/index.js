import React from 'react'
import ReactDOM from 'react-dom'
import '@arco-design/web-react/dist/css/arco.css'

import { Card, Grid, Link } from '@arco-design/web-react'

import cityImg from './static/images/city.webp'
import buildImg from './static/images/building.png'
import mapImg from './static/images/map.png'
import gisImg from './static/images/gis.png'
import effectImg from './static/images/effect.png'
import solarImg from './static/images/solar.webp'

const { Row, Col } = Grid

const { Meta } = Card

var data = [
    { title: 'City', page: '/city.html', img: cityImg, content: 'ThreeJS智慧城市特效案例' },
    { title: 'Map', page: '/map.html', img: mapImg, content: 'ThreeJS GEOJSON地图案例' },
    { title: 'Building', page: '/building.html', img: buildImg, content: 'ThreeJS GEOJSON建筑白膜案例' },
    { title: 'Gis', page: '/gis.html', img: gisImg, content: 'ThreeJS+高德地图+GEOJSON案例' },
    { title: 'Solar', page: '/solar.html', img: solarImg, content: 'ThreeJS+太阳系动画' },
    { title: 'Shader', page: '/shader.html', img: gisImg, content: 'Shader调试环境' },
    { title: 'Effect', page: '/effect.html', img: effectImg, content: '可视化特效案例' }
]

const App = () => {
    return (
        <div style={{ margin: 24 }}>
            <Row gutter={48}>
                {data.map((item) => {
                    return (
                        <Col span={8} style={{ marginBottom: 24 }}>
                            <Link href={item.page}>
                                <Card
                                    hoverable
                                    cover={
                                        <div style={{ height: 244, overflow: 'hidden' }}>
                                            <img style={{ width: '100%', transform: 'translateY(-20px)' }} alt="dessert" src={item.img} />
                                        </div>
                                    }
                                >
                                    <Meta title={item.title} description={item.content} />
                                </Card>
                            </Link>
                        </Col>
                    )
                })}
            </Row>
        </div>
    )
}

var container = document.createElement('div')
document.body.appendChild(container)

ReactDOM.render(<App></App>, container)
