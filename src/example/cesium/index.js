import { Ion, Viewer, Terrain, createOsmBuildingsAsync, Cartesian3, Math } from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// Your access token can be found at: https://cesium.com/ion/tokens.
// This is the default access token
Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk'

const mainApp = async () => {
    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    const viewer = new Viewer('container', {
        infoBox: false,
        // 图层选择
        // baseLayerPicker: false,
        // 播放动画
        animation: false,
        // 时间轴
        timeline: false,
        // 查询按钮
        // geocoder: false,
        // home按钮
        // homeButton: false,
        // 控制查看器显示模式
        sceneModePicker: false,
        // 帮助按钮
        navigationHelpButton: false,
        // 全屏
        fullscreenButton: false,
        vrButton: false,
        selectionIndicator: false,
        terrain: Terrain.fromWorldTerrain()
    })

    // Add Cesium OSM Buildings, a global 3D buildings layer.
    const buildingTileset = await createOsmBuildingsAsync()
    viewer.scene.primitives.add(buildingTileset)

    // Fly the camera to San Francisco at the given longitude, latitude, and height.
    viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
        orientation: {
            heading: Math.toRadians(0.0),
            pitch: Math.toRadians(-15.0)
        }
    })
}

mainApp()

export default mainApp
