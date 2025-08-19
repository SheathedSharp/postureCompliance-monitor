<!--
 * EyeballSimulation.vue
 * 3D Eyeball simulation component with posture visualization
 * Provides interactive 3D scene with eyeball model, water level simulation, and lesion area marking
-->
<template>
  <div class="eyeballSimulation">
    <div class="canvas-container">
      <div id="canvas" ref="renderer"></div>
      <div class="red-point-info" v-if="redPointPosition || lesionAreaPoints">
        <div class="red-point">
          <div class="point-index" v-if="shapeMode == 'mode1'">红点坐标： X: {{ redPointPosition.x.toFixed(2) }}, Y: {{
            redPointPosition.y.toFixed(2) }},
            Z: {{ redPointPosition.z.toFixed(2) }}</div>
          <div class="point-index" v-if="shapeMode == 'mode2'" v-for="item in lesionAreaPoints">
            红点坐标： X: {{ item.x.toFixed(2) }}, Y: {{ item.y.toFixed(2) }},Z: {{ item.z.toFixed(2) }}
          </div>
        </div>

      </div>
      <div class="shape-option" v-if="showShapeOptions">
        <el-select v-model="shapeMode" placeholder="请选择画图的形状">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="select-container">
      <div class="select-item" style="border-radius: 0 20px 0 0">
        <div class="item-content">
          <div class="child">
            <div class="title">气泡</div>
            <input type="text" v-model="bubbleVolume" @input="handlechildV"><span class="scale">%</span>
          </div>
          <div class="child">
            <div class="title">眼轴</div>
            <input type="text" v-model="radius" style="width: 50px; height: auto" />
            <div class="title">眼球直径</div>
            <input type="text" v-model="radius" style="width: 50px; height: auto" />
          </div>
          <div class="child">
            <div class="title">眼球相关病史</div>
            <input type="text" />
          </div>
        </div>
        <div class="item-head">
          <div class="head-content">眼球相关数据</div>
        </div>
      </div>
      <div class="select-item">
        <div class="item-content">
          <div class="child">
            <div class="title">警戒时间</div>
            <input type="text" />
          </div>
          <div class="child">
            <div class="title">角度余裕</div>
            <input type="text" v-model="angleMargin" @input="handleAngleMargin" style="height: auto;" />
            <span class="scale">%</span>
          </div>
        </div>
        <div class="item-head">
          <div class="head-content" style="font-size: 22px">
            体位相关数据设置
          </div>
        </div>
      </div>
      <div class="select-item">
        <div class="item-content">
          <div class="child">
            <div class="title">角度范围</div>
            <input type="text" v-model="angleRange" />
          </div>
          <div class="child">
            <div class="title">可用体位</div>
            <input type="text" />
          </div>
        </div>
        <div class="item-head">
          <div class="head-content">可供参考体位</div>
        </div>
      </div>
    </div>
    <div class="control-container">
      <div class="direction-control">
        <div class="origin">
          <el-button type="primary" icon="el-icon-video-camera-solid" @click="resetCameraPosition"></el-button>
        </div>
        <div class="wasd">
          <el-button type="primary" icon="el-icon-caret-top" @click="resetCameraPosition('top')"></el-button>
          <el-button type="primary" icon="el-icon-caret-bottom" @click="resetCameraPosition('bottom')"></el-button>
          <el-button type="primary" icon="el-icon-caret-left" @click="resetCameraPosition('left')"></el-button>
          <el-button type="primary" icon="el-icon-caret-right" @click="resetCameraPosition('right')"></el-button>
        </div>
      </div>
      <div class="fuction-control">
        <div class="click-item">
          <span class="switch-text" :style="{ color: isDraw ? 'brown' : 'white' }">点模式</span>
          <el-button class="circular-button" :circle="true" @click="handleDotModelChange"
            :style="{ color: isDraw ? 'brown' : 'white' }">
            <i class="el-icon-thumb"></i>
            <div class="button-text" :style="{ color: isDraw ? 'brown' : 'white' }">{{ isDraw ? '开' : '关' }}</div>
          </el-button>
        </div>
        <div class="click-item">
          <span class="switch-text" :style="{ color: showAxes ? 'brown' : 'white' }">坐标轴</span>
          <el-button class="circular-button" :circle="true" @click="toggleAxes"
            :style="{ color: showAxes ? 'brown' : 'white' }">
            <i class="el-icon-location-outline"></i>
            <div class="button-text" :style="{ color: showAxes ? 'brown' : 'white' }">{{ showAxes ? '开' : '关' }}</div>
          </el-button>
        </div>
        <div class="click-item">
          <span class="switch-text" :style="{ color: isRotate ? 'brown' : 'white' }">旋转球</span>
          <el-button class="circular-button" :circle="true" @click="handleRotateChange"
            :style="{ color: isRotate ? 'brown' : 'white' }">
            <i class="el-icon-refresh"></i>
            <div class="button-text" :style="{ color: isRotate ? 'brown' : 'white' }">{{ isRotate ? '开' : '关' }}</div>
          </el-button>
        </div>
        <div class="click-item">
          <span class="switch-text" :style="{ color: 'white' }">清空点</span>
          <el-button class="circular-button" :circle="true" @click="clearRedPoints" :style="{ color: 'white' }">
            <i class="el-icon-delete"></i>
          </el-button>
        </div>
      </div>
      <div class="parameter-control-and-line-tips">
        <div class="parameter-control">
          <div class="bubble-control">
            <el-progress type="dashboard" :percentage="progressValue" :width="100" color="#02c0f5"
              text-color="white"></el-progress>
            <div>
              <el-button-group class="btn-group">
                <el-button @click="bubbleVDecrease">-</el-button>
                <el-button @click="bubbleVIncrease">+</el-button>
              </el-button-group>
            </div>
          </div>
          <div class="margin-control">
            <el-progress type="dashboard" :percentage="angleMargin" :width="100" color="#87260d"
              text-color="white"></el-progress>
            <div>
              <el-button-group class="btn-group">
                <el-button @click="marginDecrease">-</el-button>
                <el-button @click="marginIncrease">+</el-button>
              </el-button-group>
            </div>
          </div>
        </div>
        <div class="line-tips">
          <div style="color: #ff0000;"><span class="line-name">X轴:</span><span class="line"></span></div>
          <div style="color: #0000ff;"><span class="line-name">Y轴:</span><span class="line"></span></div>
          <div style="color: #00ff00;"><span class="line-name">Z轴:</span><span class="line"></span></div>
          <div style="color: #02c0f5;"><span class="line-name">水线:</span><span class="line"></span></div>
          <div style="color: #87260d;"><span class="line-name">警戒线:</span><span class="line"></span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Switch } from "element-ui";
import { Button } from "element-ui";
import { Progress } from "element-ui";
import { Select } from "element-ui";
import { Option } from "element-ui";

export default {
  data() {
    return {
      camera: null,
      isDraw: false,
      isRotate: false,
      axes: null,
      showAxes: false,
      container: null,
      progressValue: 50, // 进度条当前值
      bubbleVolume: 50,
      maxValue: 100, // 进度条最大值
      controls: null, // 添加控件作为数据属性

      radius: 2.2, // 为数据添加半径以使其可以在方法中访问
      angleMargin: 10,//初始的角度余裕
      angleRange: null,//角度范围
      outerSphere: null,
      innerSphere: null, // 添加innerSphere作为数据属性
      waterLine: null, // 将waterLine声明为数据属性
      initWaterLinePositions: null, // 将初始水线位置声明为数据属性
      initCordonPositions: null, // 将初始警戒线位置声明为数据属性
      waterSurface: null, // 将waterSurface声明为数据属性
      waterGroup: null, // 将waterGroup声明为数据属性
      cordon: null,
      pupil: null,
      iris: null,
      macula: null,
      bloodVessel: null,

      lastCameraRotation: null, // 用于存储上一次摄像机旋转的值
      showShapeOptions: false, // 是否显示形状选项
      showRedPoints: false, // 是否显示红点和引导线
      redPointPosition: null, // 红点的位置
      lesionArea: null, // 病变区域
      initialCameraPosition: { x: 0, y: 0, z: -5 },
      initialAngle: 161.16375, //初始的角度

      options: [{
        value: 'mode1',
        label: '圆圈形'
      }, {
        value: 'mode2',
        label: '无规则形'
      }],
      shapeMode: '',
      isDrawKeyPressed: false,//是否按下esc键
      lesionAreaPoints: [],//病变区域的点（用户标记的定位点）
      allLesionAreaPositions: [],//病变区域全部的点
    };
  },
  mounted() {
    this.container = document.getElementById("canvas");
    this.init(this.container.offsetWidth, this.container.offsetHeight);
    this.$nextTick(() => {
      // 将点击事件监听器添加到画布
      this.$refs.renderer.addEventListener("click", this.handleCanvasClick);
      window.addEventListener("keydown", this.handleKeyDown); // 添加键盘事件监听器
      window.addEventListener("keyup", this.handleKeyUp); // 添加键盘事件监听器
      this.addControls();
      // 添加检查以确保定义了 innerSphere
      if (this.innerSphere) {
        this.syncInnerSphereRotation(); // 同步旋转
      }
      // 定义innerSphere后启动动画循环
      this.animate(this.scene, this.camera, this.renderer, this.sphere);
    });
  },
  methods: {
    showSysInfo(message_head, message_body) {
      const h = this.$createElement;
      this.$message({
        message: h('p', null, [
          h('span', null, message_head),
          h('i', { style: 'color: teal' }, message_body)
        ])
      });
    },
    resetCameraPosition(direction) {
      if (this.camera) {
        // 根据传递的方向参数执行不同的操作
        if (direction === 'top') {
          // 执行向上重置操作
          this.camera.position.set(0, 5, 0);
          this.showSysInfo('提示：', '已重置摄像机位置为仰视');
        } else if (direction === 'bottom') {
          // 执行向下重置操作
          this.camera.position.set(0, -5, 0);
          this.showSysInfo('提示：', '已重置摄像机位置为俯视');
        } else if (direction === 'left') {
          // 执行向左重置操作
          this.camera.position.set(5, 0, 0);
          this.showSysInfo('提示：', '已重置摄像机位置为左视');
        } else if (direction === 'right') {
          // 执行向右重置操作
          this.camera.position.set(-5, 0, 0);
          this.showSysInfo('提示：', '已重置摄像机位置为右视');
        }
        else {
          // 设置摄像机的位置为初始位置
          this.camera.position.set(
            this.initialCameraPosition.x,
            this.initialCameraPosition.y,
            this.initialCameraPosition.z
          );
          this.showSysInfo('提示：', '已重置摄像机位置为初始位置');
        }

        this.camera.lookAt(0, 0, 0); // 让摄像机朝向原点
      }
    },
    /*
      说明文档！！！！
    */
    calculateAngleRange() {
      if (!this.lesionArea || !this.waterLine) {
        // 如果病变区域或水线不存在，无法计算角度范围
        return null;
      }

      const angleArray = []; // 用于存储所有角度的数组

      // 计算垂直于水线平面的向量
      const waterLineGeometry = this.waterLine.geometry;
      const waterLinePositions = waterLineGeometry.getAttribute("position").array;

      // 选择三个点
      const p1 = new THREE.Vector3(waterLinePositions[0], waterLinePositions[1], waterLinePositions[2]);
      const p2 = new THREE.Vector3(waterLinePositions[90], waterLinePositions[91], waterLinePositions[92]);
      const p3 = new THREE.Vector3(waterLinePositions[180], waterLinePositions[181], waterLinePositions[182]);

      // 计算向量 v1 和 v2
      const v1 = new THREE.Vector3().subVectors(p2, p1);
      const v2 = new THREE.Vector3().subVectors(p3, p1);

      // 计算水线所在的平面
      const plane = new THREE.Plane().setFromCoplanarPoints(p1, p2, p3);
      // 计算水线所在平面的法向量
      const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
      // 计算原点到平面的距离
      const distanceToPlane = plane.constant / normal.length();
      // 根据法向量和距离调整原点的位置
      const mappedPosition = new THREE.Vector3().copy(normal).multiplyScalar(distanceToPlane);

      // 计算病变区域相对于法向量的位方向向量
      const allLesionAreaPositions = this.allLesionAreaPositions;

      for (let i = 0; i < allLesionAreaPositions.length; i += 3) {
        // 为每个顶点创建一个向量
        const vertex = new THREE.Vector3(allLesionAreaPositions[i], allLesionAreaPositions[i + 1], allLesionAreaPositions[i + 2]);
        const OR = new THREE.Vector3().subVectors(vertex, mappedPosition);

        const dotProduct = OR.x * normal.x + OR.y * normal.y + OR.z * normal.z;        // 向量与法向量的点积

        // 两个向量的模长（长度）
        const lengthR = Math.sqrt(OR.x ** 2 + OR.y ** 2 + OR.z ** 2);
        const lengthN = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);

        // 计算theta夹角的弧度值并将弧度转换为度数
        const thetaRadians = Math.acos(Math.abs(dotProduct) / (lengthR * lengthN));
        const angleRadians = Math.PI / 2 - thetaRadians;
        const angleDegrees = angleRadians * 180 / Math.PI;

        angleArray.push(angleDegrees);
      }

      // 计算角度范围
      const angleRange = [Math.min(...angleArray), Math.max(...angleArray)];
      console.log("angleRange:", angleRange);

      // 根据角度余裕调整角度范围
      const marginRate = (100 - this.angleMargin) / 100;
      const finalAngleRange = angleRange.map(angle => parseFloat((angle * marginRate).toFixed(3)));

      // 若警戒线不存在
      if (!this.cordon) {
        const bAngle = angleRange[0] * this.angleMargin / 100; // 求出警戒线与水平面的夹角

        // 求出警戒线与原点所在平面的夹角
        const bAngleRadians = bAngle * Math.PI / 180; // 求出警戒线与水平面的夹角所对应的弧度
        // 根据正弦定理求出警戒线与法向量的夹角
        const alphaAngleRadians = Math.asin(Math.sin(bAngleRadians + Math.PI / 2) * distanceToPlane / (this.radius));
        const betaAngleRadians = Math.PI / 2 - alphaAngleRadians - bAngleRadians;

        // 创建警戒线
        const cordonMaterial = new THREE.LineBasicMaterial({ //创建警戒线的材质
          color: 0x87260d,
        });
        const cordonGeometry = new THREE.BufferGeometry(); // 创建警戒线几何缓冲图形
        const segments = 120; // 分段数
        const cordonRadius = Math.sin(betaAngleRadians) * this.radius;
        const cordonPostions = []; //警戒线顶点数组

        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const cordonX = Math.cos(theta) * cordonRadius;
          const cordonY = Math.cos(betaAngleRadians) * this.radius;
          const cordonZ = Math.sin(theta) * cordonRadius;

          cordonPostions.push(cordonX, cordonY, cordonZ);
        }

        cordonGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(cordonPostions, 3)
        );

        // 保存初始警戒线位置
        this.initCordonPositions = cordonPostions;

        // 添加警戒线
        const cordon = new THREE.Line(cordonGeometry, cordonMaterial);
        this.cordon = cordon;
        this.waterGroup.add(cordon);

      }

      return finalAngleRange;
    },
    addControls() {
      if (!this.camera || !this.$refs.renderer) {
        console.error("Camera or renderer not defined");
        return;
      }
      this.controls = new OrbitControls(this.camera, this.$refs.renderer);
      this.controls.enableDamping = true; // 启用阻尼效果，使交互更平滑
      // 添加其他控制选项，如最小/最大缩放距离、旋转速度等
      this.controls.enabled = !this.isDraw; // Enable/Disable controls based on isDraw
    },
    handleDotModelChange() {
      this.isDraw = !this.isDraw;
      if (this.controls) {
        this.controls.enabled = !this.isDraw;
        this.showSysInfo('提示：', '已切换到' + (this.isDraw ? '点模式，请选择病变区域的形状' : '摄像机模式'));
        this.showShapeOptions = this.isDraw;
      }
      if (!this.isDraw) {
        // Ensure that the innerSphere rotation matches the camera when not in draw mode
        // const cameraRotation = new THREE.Euler();
        // cameraRotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
        // this.innerSphere.rotation.copy(cameraRotation);
      }
    },
    init(width, height) {
      const scene = this.createScene();
      const camera = this.createCamera(width, height);
      const renderer = this.createRenderer(width, height);
      const sphere = this.createSphere();
      const waterSurface = this.createWaterSurface();

      this.addLights(scene);
      this.addObjects(scene, sphere, waterSurface);
      this.createAxes(scene);
      this.animate(scene, camera, renderer, sphere);
      this.container.appendChild(renderer.domElement);
    },
    createScene() {
      const scene = new THREE.Scene();
      this.redPointsGuide = new THREE.Group(); // 创建一个用于存储红点引导线的Group
      scene.add(this.redPointsGuide); // 将Group添加到场景中
      return scene;
    },
    createCamera(width, height) {
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10);
      camera.position.z = -5;
      this.camera = camera;
      return camera;
    },
    createRenderer(width, height) {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0xeeeeee, 0.0);
      return renderer;
    },
    createSphere() {
      /*
      创建外部球体：
      */
      const radius = this.radius;
      const outerGeometry = new THREE.SphereGeometry(radius, 32, 32);

      const outerMaterial = new THREE.MeshPhongMaterial({
        // map: texture
        color: 0xffffff, // 定义外部的球为白色
        transparent: true,
        opacity: 0.6, // 降低不透明度以减少反射
        metalness: 0.5,
        roughness: 0.3,
      });


      const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial); //创建外部球体

      // 创建外部球体上的子物体
      const pupil = this.createPupil();
      const iris = this.createIris();
      const macula = this.createMacula();
      const bloodVessel = this.createBloodVessel(macula, outerSphere);

      // 将子物体添加到外部球体上
      outerSphere.add(pupil);
      outerSphere.add(iris);
      outerSphere.add(macula);
      outerSphere.add(bloodVessel);


      /*
        创建内部球体：
      */
      // 1. 将初始的角度制转化弧度制
      // 2. 最后确定SphereGeometry的thetaLength属性
      const thetaLengthRadians = this.initialAngle * (Math.PI / 180);
      const InnerGeometryLengthRadians = Math.PI - thetaLengthRadians / 2;

      const innerGeometry = new THREE.SphereGeometry(
        radius - 0.1,
        240,
        240,
        0,
        2 * Math.PI,
        Math.PI,
        InnerGeometryLengthRadians
      );
      const innerMaterial = new THREE.MeshPhongMaterial({
        color: 0x02c0f5, // 定义内部的球体为蓝色
        opacity: 1,
        metalness: 0.5,
        roughness: 0.3,
      });
      const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);

      innerSphere.scale.set(1, 1, 1); // 缩放内球体(蓝球）

      this.outerSphere = outerSphere;
      this.innerSphere = innerSphere;

      // 将两个球体组合在一起以便于操作
      const sphereGroup = new THREE.Group();
      sphereGroup.add(outerSphere);
      sphereGroup.add(innerSphere);


      this.sphere = sphereGroup;
      this.outerSphere = outerSphere;
      this.innerSphere = innerSphere;


      return sphereGroup;
    },
    createAxes(scene) {
      const length = 2.5;

      const materialX = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const materialY = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const materialZ = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const geometryX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(length, 0, 0),
      ]);
      const geometryY = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, length, 0),
      ]);
      const geometryZ = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, length),
      ]);

      const xAxis = new THREE.Line(geometryX, materialX);
      const yAxis = new THREE.Line(geometryY, materialY);
      const zAxis = new THREE.Line(geometryZ, materialZ);

      this.axes = new THREE.Group();
      this.axes.add(xAxis);
      this.axes.add(yAxis);
      this.axes.add(zAxis);
      this.axes.visible = this.showAxes;

      scene.add(this.axes);
    },
    calculateAngle(volume) {
      // 拟合的函数 y = 758.83x^3 - 1041.24x^2 + 632.76x + 10.24
      return 758.83 * Math.pow(volume, 3) - 1041.24 * Math.pow(volume, 2) + 632.76 * volume + 10.24;
    },
    createWaterSurface() {
      const self = this;
      /* 
        创建水线
      */
      const waterLineMaterial = new THREE.LineBasicMaterial({ //创建水线的材质
        color: 0x02c0f5,
      });

      const waterLineGeometry = new THREE.BufferGeometry(); // 创建水线几何缓冲图形

      // 各个参数
      const radius = this.radius; // 使用外部球体的半径
      const segments = 120; // 分段数
      const targetAngle = this.calculateAngle(0.5); // 目标角度
      const thetaLengthRadians = targetAngle * (Math.PI / 180); // 目标角度所对应的弧度
      const phi = thetaLengthRadians / 2;
      const waterLineRadius = Math.sin(phi) * radius;


      const waterLinePositions = []; // 水线顶点数组


      /*
        说明文档：！！！！
      */
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;

        const waterLineX = Math.cos(theta) * waterLineRadius;
        const waterLineY = Math.cos(thetaLengthRadians / 2) * radius;
        const waterLineZ = Math.sin(theta) * waterLineRadius; // 初始水线位置是初始角度与球体的接触横截面

        waterLinePositions.push(waterLineX, waterLineY, waterLineZ);
      }


      waterLineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(waterLinePositions, 3)
      );


      const waterLine = new THREE.Line(waterLineGeometry, waterLineMaterial);

      // 保存初始水线位置
      this.initWaterLinePositions = waterLinePositions;

      /* 
        创建水面
        说明文档！！！！
      */
      const waterLinePositionsArray = waterLineGeometry.getAttribute("position").array; // 先获取水线的各个顶点信息
      const waterLinePositionsArrDistance = ((waterLinePositions.length / 3) - 1) / 2 * 3; // 访问水线的点从而确定p1,p4固定的y值达到水线与水面贴合

      // 创建水面控制点
      const p1 = new THREE.Vector3(0, waterLinePositionsArray[0 + waterLinePositionsArrDistance] + 0.1, waterLinePositionsArray[1]); // 贝塞尔曲线的控制点p1
      const p2 = new THREE.Vector3(0, waterLinePositionsArray[0 + waterLinePositionsArrDistance] + 0.1, waterLinePositionsArray[1] - 0.8); // 贝塞尔曲线的控制点p2
      const p3 = new THREE.Vector3(0, waterLinePositionsArray[0] - 0.1, waterLinePositionsArray[1] - 0.8); // 贝塞尔曲线的控制点p3
      const p4 = new THREE.Vector3(0, waterLinePositionsArray[0] - 0.1, waterLinePositionsArray[1]); // 贝塞尔曲线的控制点p4  

      // 创建初始贝塞尔曲线
      const initialCurve = new THREE.CubicBezierCurve3(p1, p2, p3, p4);

      // 获取初始贝塞尔曲线上的点
      const initialPoints = initialCurve.getPoints(100);
      // 将初始贝塞尔曲线上的点转换成适合用于 LatheGeometry 的点
      const initialLathePoints = initialPoints.map(point => new THREE.Vector2(point.y, point.z));

      // 创建 LatheGeometry
      const latheGeometry = new THREE.LatheGeometry(initialLathePoints, 1000, 0, Math.PI * 2);

      const waterSurfaceMaterial = new THREE.MeshPhongMaterial({
        color: 0x44474b, // 定义外部的球为白色
        metalness: 0.4,
        roughness: 0.1,
        side: THREE.DoubleSide
      });

      const waterSurface = new THREE.Mesh(latheGeometry, waterSurfaceMaterial);

      const waterGroup = new THREE.Group(); // Create a group for water elements
      waterGroup.add(waterLine);
      waterGroup.add(waterSurface);
      this.waterGroup = waterGroup;
      this.innerSphere.add(waterGroup);

      this.waterLine = waterLine;
      this.waterSurface = waterSurface;

      return waterGroup;
    },
    createPupil() {
      const pupilGeometry = new THREE.SphereGeometry(0.3, 64, 64);
      const pupilTexture = new THREE.TextureLoader().load(require("../assets/pupilTexture.jpg"));
      const pupilMaterial = new THREE.MeshBasicMaterial({
        map: pupilTexture,
        color: 0x2a2c2c  // 选择一个鲜艳的颜色，如红色
        // color: 0x2a2c2c
      });
      const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
      pupil.scale.set(1.5, 1.5, 0.5);
      pupil.position.set(0, 0, -2.2);

      this.pupil = pupil;
      return pupil;
    },
    createIris() {
      const irisGeometry = new THREE.TorusGeometry(0.45, 0.15, 30);
      const irisTexture = new THREE.TextureLoader().load(require("../assets/irisTexture.png"));
      const irisMaterial = new THREE.MeshBasicMaterial({
        // color: 0x87260d,
        map: irisTexture
        // side: THREE.DoubleSide 
      });
      const iris = new THREE.Mesh(irisGeometry, irisMaterial);

      iris.position.set(0, 0, -2.2);
      // pupil.scale.set(0.5, 1.5, 1.5);
      this.iris = iris;
      return iris;
    },
    createMacula() {
      const maculaGeometry = new THREE.SphereGeometry(0.15, 64, 64);
      const maculaTexture = new THREE.TextureLoader().load(require("../assets/maculaTexture.png"));
      const maculaMaterial = new THREE.MeshBasicMaterial({
        map: maculaTexture,
        // color: 0x000000
      });
      const macula = new THREE.Mesh(maculaGeometry, maculaMaterial);
      macula.scale.set(1.5, 1.5, 0.5);
      macula.position.set(0, 0, 2.2);

      this.macula = macula;
      return macula;
    },
    createCurve(points) {
      const curve = new THREE.CatmullRomCurve3(
        points.map((point) => new THREE.Vector3(point.x, point.y, point.z)),
        true // 设置为 true 使曲线首尾相连
      );
      const curvePoints = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const material = new THREE.LineBasicMaterial({ color: 0xb00f0c });
      const curveObject = new THREE.Line(geometry, material);

      return curveObject;
    },
    createBloodVessel(macula, outerSphere) {
      /*
        获取外部球体上的顶点信息
      */
      const positions = outerSphere.geometry.getAttribute('position').array;
      const redPointCoordinates = [];
      const numVertices = positions.length / 3
      for (let i = 0; i < numVertices; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        redPointCoordinates.push({
          index: i,
          x: x,
          y: y,
          z: z
        });
      }

      /*
        创建血管
      */
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const BloodVessel = new THREE.Group();

      function createBloodBesselCurve(points) {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 2.2),
          ...points.map((point) => new THREE.Vector3(point.x, point.y, point.z))
        ]);
        const curvePoints = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const curveObject = new THREE.Line(geometry, material);
        BloodVessel.add(curveObject);
      }

      const redPointCoordinatesArray = [
        [471, 340, 209, 74],
        [469, 335, 202, 68],
        [505, 474, 443, 411],
        [603, 736, 864, 999],
        [600, 667, 730, 796]
      ];

      for (const points of redPointCoordinatesArray) {
        createBloodBesselCurve(points.map(index => redPointCoordinates[index]));
      }

      this.bloodVessel = BloodVessel;

      return BloodVessel;
    },
    handleRotateChange() {
      // 更新isRotate的值
      this.isRotate = !this.isRotate;

      // 如果isRotate为true，启用内部球的旋转
      if (this.isRotate) {
        this.syncInnerSphereRotation(this.camera);
      }
      this.showSysInfo('提示：', '已切换到' + (this.isRotate ? '旋转模式' : '摄像机模式'));
    },
    addLights(scene) {
      const ambientLight = new THREE.AmbientLight(0xffffee, 10);
      scene.add(ambientLight);
      // const topLight = new THREE.PointLight(0xffffff, 1, 10);
      // topLight.position.set(0, 3, 3);
      // const bottomLight = new THREE.PointLight(0xffffff, 1, 10);
      // bottomLight.position.set(0, 3, -3);

      // scene.add(topLight);
      // scene.add(bottomLight);
    },
    addObjects(scene, sphere, waterSurface) {
      // 将两个球体组合在一起以便于操作
      const eyeball = new THREE.Group();
      eyeball.add(sphere);
      eyeball.add(waterSurface);
      scene.add(eyeball);
    },
    syncInnerSphereRotation(camera) {
      if (this.isRotate) {
        // 获取摄像机的旋转信息
        const cameraRotation = new THREE.Euler();
        cameraRotation.setFromQuaternion(camera.quaternion, camera.rotation.order);

        // 将旋转应用到内部对象
        this.innerSphere.rotation.copy(cameraRotation);
        // this.waterLine.rotation.copy(cameraRotation);
        // this.cordon.rotation.copy(cameraRotation);
        this.waterSurface.rotation.copy(cameraRotation);

        // 只在摄像机旋转时更新水线顶点和警戒线顶点位置
        if (this.lastCameraRotation && !this.lastCameraRotation.equals(cameraRotation)) {
          const waterLineGeometry = this.waterLine.geometry;
          const waterLinePositions = this.initWaterLinePositions.slice();
          const cordonGeometry = this.cordon.geometry;
          const cordonPositions = this.initCordonPositions.slice();

          const quaternion = camera.getWorldQuaternion(new THREE.Quaternion())

          // 更新水线顶点位置
          for (let i = 0; i < waterLinePositions.length; i += 3) {
            const waterLineVetex = new THREE.Vector3(waterLinePositions[i], waterLinePositions[i + 1], waterLinePositions[i + 2]);
            waterLineVetex.applyQuaternion(quaternion);
            waterLinePositions[i] = waterLineVetex.x;
            waterLinePositions[i + 1] = waterLineVetex.y;
            waterLinePositions[i + 2] = waterLineVetex.z;
          }

          // 更新警戒线顶点位置
          for (let i = 0; i < cordonPositions.length; i += 3) {
            const cordonVetex = new THREE.Vector3(cordonPositions[i], cordonPositions[i + 1], cordonPositions[i + 2]);
            cordonVetex.applyQuaternion(quaternion);
            cordonPositions[i] = cordonVetex.x;
            cordonPositions[i + 1] = cordonVetex.y;
            cordonPositions[i + 2] = cordonVetex.z;
          }

          // 更新顶点信息
          waterLineGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(waterLinePositions), 3));
          waterLineGeometry.getAttribute("position").needsUpdate = true;
          cordonGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(cordonPositions), 3));
          cordonGeometry.getAttribute("position").needsUpdate = true;
        }

        // 记录上一次的摄像机旋转
        this.lastCameraRotation = cameraRotation;

        // 更新角度范围
        this.angleRange = this.calculateAngleRange();
      }
    },
    animate(scene, camera, renderer, sphere) {
      const self = this; // 将“this”存储在变量中
      function animate() {
        requestAnimationFrame(animate);

        // 计算相机距球体中心的距离
        const distance = camera.position.distanceTo(sphere.position);

        // 设置允许的最小和最大距离
        const minDistance = 3;
        const maxDistance = 6;

        // 将距离限制在允许的范围内
        const clampedDistance = THREE.MathUtils.clamp(
          distance,
          minDistance,
          maxDistance
        );

        // 更新相机的位置
        camera.position.setLength(clampedDistance);

        // 使用“self”更新innerSphere的旋转以引用组件实例
        self.syncInnerSphereRotation(camera);

        if (renderer) {
          renderer.render(scene, camera);
        }
      }
      animate();
    },
    bubbleVDecrease() {
      this.progressValue--;
      const bubbleFraction = this.caculateBubbleFraction()
      console.log("bubbleFraction", bubbleFraction)
      this.updateState(bubbleFraction); // 根据气泡所占比来调整球体的状态
    },
    bubbleVIncrease() {
      this.progressValue++;
      const bubbleFraction = this.caculateBubbleFraction()
      this.updateState(bubbleFraction); // 根据气泡所占比来调整球体的状态
    },
    marginDecrease() {
      this.angleMargin--;
      const bubbleFraction = this.caculateBubbleFraction()
      this.updateState(bubbleFraction); // 根据气泡所占比来调整球体的状态
    },
    marginIncrease() {
      this.angleMargin++;
      const bubbleFraction = this.caculateBubbleFraction()
      this.updateState(bubbleFraction); // 根据气泡所占比来调整球体的状态
    },
    caculateBubbleFraction() {
      // 计算气泡体积值
      this.bubbleVolume = 100 - this.progressValue;
      // 计算气泡分数限制为最大值 1
      return Math.min(this.bubbleVolume / this.maxValue, 1)
    },
    clearRedPoints() {
      // 移除之前的红点
      const childrenToRemove = this.sphere.children.filter(child => child.userData.isRedPoint || child.userData.isLesionAreaPoint);      // 获取需要删除的子元素

      // 删除子元素
      childrenToRemove.forEach(child => {
        this.sphere.remove(child);
        child.geometry.dispose();
        child.material.dispose();
      });


      // 移除病变区域圆圈或不规则形
      this.sphere.children.forEach(child => {
        if (child.userData.isLesionArea) {
          this.sphere.remove(child);
          child.geometry.dispose();
          child.material.dispose();
        }
      });


      // 其他清理操作
      this.showRedPoints = false;
      this.redPointPosition = null;
      this.redPointsGuide.children = [];
      this.lesionArea = null;
      this.isDraw = false;
      this.controls.enabled = true;
      this.lesionAreaPoints = [];
      this.allLesionAreaPositions = [];

      // 删除警戒线
      this.waterGroup.remove(this.cordon);
      this.cordon = null;
    },
    /*
      说明文档！！！！
    */
    handleCanvasClick(event) {
      // 如果不是绘制模式，不执行任何操作
      if (!this.isDraw) return;
      // 如果没有选择形状，不执行任何操作
      if (!this.shapeMode) {
        this.showSysInfo('提示：', '请先选择病变区域的形状');
        return;
      }

      // 如果是圆圈绘制模式，执行以下操作
      if (this.shapeMode === 'mode1') {
        const canvasBoundingRect = this.$refs.renderer.getBoundingClientRect();
        const canvasWidth = canvasBoundingRect.width;
        const canvasHeight = canvasBoundingRect.height;

        const mouse = {
          x: ((event.clientX - canvasBoundingRect.left) / canvasWidth) * 2 - 1,
          y: -((event.clientY - canvasBoundingRect.top) / canvasHeight) * 2 + 1,
        };

        // 创建一个Raycaster对象用于进行射线投射
        const raycaster = new THREE.Raycaster();
        // setFromCamera方法设置射线的起点和方向，从摄像机出发沿着鼠标位置进行射线
        raycaster.setFromCamera(mouse, this.camera);

        // this.sphere物体或其子物体相交，并将相交的结果存储在 intersects 变量中。
        const intersects = raycaster.intersectObject(this.sphere, true);
        if (intersects.length > 0) {
          const intersection = intersects[0];
          if (!this.redPointPosition) { // 第一次点击描绘中心点
            this.redPointPosition = intersection.point.clone();
            // 使用 redPointPosition 创建并添加引导线
            const guideLine = this.createGuideLine(this.redPointPosition);
            this.redPointsGuide.add(guideLine);

            // 使用 redPointPosition 创建并添加红点
            const dotGeometry = new THREE.SphereGeometry(0.08, 32, 32);
            const dotMaterial = new THREE.MeshPhongMaterial({ color: 0xb00f0c });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.userData.isRedPoint = true;
            dot.position.copy(this.redPointPosition);
            dot.scale.set(0.3, 0.3, 0.3);
            this.sphere.add(dot);
            this.showRedPoints = true; // 显示红点信息
            this.showSysInfo('提示：', '已选择病变点的中心，请选择病变区域的半径');
          }
          else if (!this.LesionArea) { //第二次点击创建以第一次点击为中心，两次点击为半径的圆圈
            // 求redPoint和intersection之间的夹角
            const redPointDirection = new THREE.Vector3(
              this.redPointPosition.x,
              this.redPointPosition.y,
              this.redPointPosition.z
            );
            const intersectionDirection = new THREE.Vector3(
              intersection.point.x,
              intersection.point.y,
              intersection.point.z
            );
            const dotProduct = redPointDirection.x * intersectionDirection.x + redPointDirection.y * intersectionDirection.y + redPointDirection.z * intersectionDirection.z;
            const lengthA = Math.sqrt(redPointDirection.x ** 2 + redPointDirection.y ** 2 + redPointDirection.z ** 2);
            const lengthB = Math.sqrt(intersectionDirection.x ** 2 + intersectionDirection.y ** 2 + intersectionDirection.z ** 2);
            const angleRadians = Math.acos(dotProduct / (lengthA * lengthB));

            // 求病变区域的半径
            const radiusOfLesionArea = lengthB * Math.sin(angleRadians)          // 病变区域的半径

            // 求创建病变区域圆圈的原点
            const centerOfCircleLength = lengthB * Math.cos(angleRadians)        // 病变区域中心点到原点的距离
            const centerOfCircle = new THREE.Vector3(
              redPointDirection.x * centerOfCircleLength / lengthA,
              redPointDirection.y * centerOfCircleLength / lengthA,
              redPointDirection.z * centerOfCircleLength / lengthA
            )

            // 创建一个圆环的线几何体
            const segments = 64; // 圆的分段数
            const innerRadius = radiusOfLesionArea - 0.01; // 内半径稍小于外半径
            const outerRadius = radiusOfLesionArea; // 外半径
            const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
            const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xb00f0c, side: THREE.DoubleSide });
            const lesionArea = new THREE.Mesh(ringGeometry, ringMaterial); // 创建一个圆环
            lesionArea.userData.isLesionArea = true;
            lesionArea.position.set(centerOfCircle.x, centerOfCircle.y, centerOfCircle.z); // 设置圆环的位置

            // 让圆环面向 redPointDirection 方向
            const lookAtPosition = new THREE.Vector3().copy(centerOfCircle).add(redPointDirection);
            lesionArea.lookAt(lookAtPosition);

            this.lesionArea = lesionArea;
            this.allLesionAreaPositions = lesionArea.geometry.attributes.position.array; // 获取圆环上的所有顶点信息

            // 将圆环添加到场景中
            this.sphere.add(lesionArea);
            this.showShapeOptions = false; // 隐藏形状选择
            this.handleDotModelChange();
            this.angleRange = this.calculateAngleRange();
          }
          return;
        }

      }
      // 如果是无规则绘制模式，执行以下操作
      if (this.shapeMode === 'mode2' && this.isDrawKeyPressed) {
        const canvasBoundingRect = this.$refs.renderer.getBoundingClientRect();
        const canvasWidth = canvasBoundingRect.width;
        const canvasHeight = canvasBoundingRect.height;

        const mouse = {
          x: ((event.clientX - canvasBoundingRect.left) / canvasWidth) * 2 - 1,
          y: -((event.clientY - canvasBoundingRect.top) / canvasHeight) * 2 + 1,
        };

        // 创建一个Raycaster对象用于进行射线投射
        const raycaster = new THREE.Raycaster();
        // setFromCamera方法设置射线的起点和方向，从摄像机出发沿着鼠标位置进行射线
        raycaster.setFromCamera(mouse, this.camera);

        // this.sphere物体或其子物体相交，并将相交的结果存储在 intersects 变量中。
        const intersects = raycaster.intersectObject(this.sphere, true);
        if (intersects.length > 0) {
          const intersection = intersects[0];
          this.lesionAreaPoints.push(intersection.point.clone());

          // 创建红点
          const dotGeometry = new THREE.SphereGeometry(0.08, 32, 32);
          const dotMaterial = new THREE.MeshPhongMaterial({ color: 0xb00f0c });
          const dot = new THREE.Mesh(dotGeometry, dotMaterial);
          dot.userData.isLesionAreaPoint = true;
          dot.position.copy(intersection.point.clone());
          dot.scale.set(0.3, 0.3, 0.3);
          this.sphere.add(dot);
          this.showRedPoints = true; // 显示红点信息
          this.showSysInfo('提示：', '已添加红点，松开D键后，点击“绘制病变区域”按钮完成绘制');
        }
      }

      // 如果是结束无规则绘制模式，执行以下操作
      if (this.shapeMode === 'mode2' && !this.isDrawKeyPressed) {
        this.lesionArea = this.createCurve(this.lesionAreaPoints);
        this.lesionArea.userData.isLesionArea = true;
        this.allLesionAreaPositions = this.lesionArea.geometry.attributes.position.array; // 获取圆环上的所有顶点信息
        this.sphere.add(this.lesionArea);
        this.handleDotModelChange();
        this.angleRange = this.calculateAngleRange();
      }
    },
    handleKeyDown(event) {
      if (event.key === "d" || event.key === "D") {
        this.isDrawKeyPressed = true;
      }
    },
    handleKeyUp(event) {
      if (event.key === "d" || event.key === "D") {
        this.isDrawKeyPressed = false;
      }
    },
    createGuideLine(position) {
      const material = new THREE.LineBasicMaterial({ color: 0xb00f0c });
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        position,
      ]);
      const guideLine = new THREE.Line(geometry, material);
      return guideLine;
    },
    toggleAxes() {
      this.showAxes = !this.showAxes; // 直接切换状态，无需传递新值
      if (this.axes) {
        this.axes.visible = this.showAxes;
      }
      this.showSysInfo('提示：', (this.showAxes ? '显示坐标轴' : '隐藏坐标轴'));
    },
    beforeDestroy() {
      // Remove the click event listener from the canvas
      this.$refs.renderer.removeEventListener("click", this.handleCanvasClick);
    },
    handlechildV(event) {
      // 获取气泡输入框的值并转换为数值
      const inputValue = event.target.value.trim();
      const newValue = inputValue === "" ? 0 : parseFloat(inputValue);

      // 更新进度条的值，限制在0到maxValue之间
      this.progressValue = Math.min(Math.max(100 - newValue, 0), this.maxValue);

      // 计算气泡分数限制为最大值 1
      const bubbleFraction = newValue / 100;

      this.updateState(bubbleFraction); // 根据气泡所占比来调整球体的状态
    },
    updateState(bubbleFraction) {
      /*
        说明文档！！！
      */
      // 根据bubbleFraction计算新的theta角度
      const newTheta = this.calculateAngle(bubbleFraction); // 新的角度
      const newThetaLengthRadians = newTheta * (Math.PI / 180); // 新的弧度
      const newInnerGeometryLengthRadians = Math.PI - newThetaLengthRadians / 2; // 新内球的弧度长度


      // 使用新的thetaLength更新innerSphere的几何形状
      this.innerSphere.geometry.dispose();
      this.innerSphere.geometry = new THREE.SphereGeometry(
        this.radius - 0.1,
        240,
        240,
        0,
        2 * Math.PI,
        Math.PI,
        newInnerGeometryLengthRadians
      );

      // 根据进度条值更新水线以及警戒线位置
      const waterLineGeometry = this.waterLine.geometry;
      const waterLinePositions = waterLineGeometry.getAttribute("position").array;
      // const cordonGeometry = this.cordon.geometry;
      // const cordonPostions = cordonGeometry.getAttribute("position").array;

      const phi = newThetaLengthRadians / 2; //  根据进度计算新的弧度
      const marginRate = (100 - this.angleMargin) / 100;
      const radius = this.radius;
      const waterLineRadius = radius * Math.sin(phi); // 水线所在水平面的圆半径
      const cordonRadius = radius * Math.sin(phi * marginRate); // 警戒线所在水平面的圆半径
      const segments = 120;

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;

        const waterLineX = Math.cos(theta) * waterLineRadius;
        const waterLineY = radius * Math.cos(phi);
        const waterLineZ = Math.sin(theta) * waterLineRadius;
        // const cordonX = Math.cos(theta) * cordonRadius;
        // const cordonY = radius * Math.cos(phi * marginRate);
        // const cordonZ = Math.sin(theta) * cordonRadius;


        // 更新x,y,z坐标
        waterLinePositions[i * 3] = waterLineX;
        waterLinePositions[i * 3 + 1] = waterLineY;
        waterLinePositions[i * 3 + 2] = waterLineZ;
        // cordonPostions[i * 3] = cordonX;
        // cordonPostions[i * 3 + 1] = cordonY;
        // cordonPostions[i * 3 + 2] = cordonZ;
      }
      waterLineGeometry.getAttribute("position").needsUpdate = true; // 将职位标记为已更新
      // cordonGeometry.getAttribute("position").needsUpdate = true; // 将职位标记为已更新


      /*
        根据进度条更新水面的位置
      */
      const waterLinePositionsArrDistance = ((waterLinePositions.length / 3) - 1) / 2 * 3; // 访问水线的点从而确定p1,p4固定的y值达到水线与水面贴合
      const yDifference = waterLinePositions[0] - Math.sqrt(2.1 * 2.1 - waterLinePositions[1] * waterLinePositions[1]);
      console.log("yDifference", yDifference);
      const yIncrement = (Math.abs(waterLinePositions[0] - 0.1)) * 1 / 10;
      const zIncrement = (radius - Math.abs(waterLinePositions[1])) / 2;

      const p1 = new THREE.Vector3(0, waterLinePositions[0] - yDifference, waterLinePositions[1]); // 贝塞尔曲线的控制点p1
      const p2 = new THREE.Vector3(0, waterLinePositions[0] - 0.1 - yIncrement, waterLinePositions[1] - zIncrement); // 贝塞尔曲线的控制点p2
      const p3 = new THREE.Vector3(0, waterLinePositions[0 + waterLinePositionsArrDistance] + 0.1 + yIncrement, waterLinePositions[1] - zIncrement); // 贝塞尔曲线的控制点p3
      const p4 = new THREE.Vector3(0, waterLinePositions[0 + waterLinePositionsArrDistance] + yDifference, waterLinePositions[1 + waterLinePositionsArrDistance]); // 贝塞尔曲线的控制点p4


      const curve = new THREE.CubicBezierCurve3(p1, p2, p3, p4);

      // 获取初始贝塞尔曲线上的点
      const points = curve.getPoints(100);

      // 将初始贝塞尔曲线上的点转换成适合用于 LatheGeometry 的点
      const lathePoints = points.map(point => new THREE.Vector2(point.y, point.z));

      // 清空 waterSurface
      this.waterSurface.geometry.dispose();

      // 更新 LatheGeometry
      this.waterSurface.geometry = new THREE.LatheGeometry(lathePoints, 1000, 0, Math.PI * 2);
    },
    handleAngleMargin(newValue) {
      this.updateState(this.caculateBubbleFraction());
    },
  },
  components: {
    "el-switch": Switch,
    "el-button": Button,
    "el-progress": Progress,
    "el-select": Select,
    "el-option": Option,
  },
};
</script>

<style scoped>
input {
  background-color: #f0f3f4;
  border-radius: 5px;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.2);
  text-align: center;
  font-weight: bold;
  font-size: 12px;
}

.eyeballSimulation {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  grid-template-rows: 1fr 0.6fr;
}

.canvas-container {
  display: flex;
  position: relative;
  justify-content: center;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  background-color: rgb(75, 136, 203);
  border-radius: 20px 0 0 0;
}

.select-container {
  display: flex;
  flex-direction: column;
  grid-row: 1 / 2;
  grid-column: 2/ 3;
  background-color: rgb(97, 161, 248);
  border-radius: 0 20px 0 0;
  margin-left: 20px;
}

.control-container {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  grid-row: 2 / 3;
  grid-column: 1/ 3;
  background-color: rgb(97, 161, 248);
  ;
  border-radius: 0 0 20px 20px;
}

.direction-control {
  display: flex;
  flex-direction: row;
  width: 120px;
  height: 100%;
}

.origin {
  width: 60px;
  height: 100%;
  display: flex;
  margin-right: 2px;
}

.origin ::v-deep .el-button {
  flex: 1;
  padding: 0;
  border: 1px solid grey;
  background-color: #3B86A5;
  color: white;
}

.wasd {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.wasd ::v-deep .el-button {
  flex: 1;
  padding: 10px;
  margin: 0;
  border: 1px solid grey;
  background-color: #3B86A5;
  color: white;
}

.fuction-control {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 5px;
  padding-left: 15px;
  padding-right: 15px;
  border-right: 2px solid grey;
  width: 500px;
}

.click-item {
  margin-left: 0px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  width: 110px;
  height: 100%;
}

.click-item ::v-deep .el-button {
  padding: 0;
  border: 1px solid grey;
  background-color: #60BEEB;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 85%;
  height: 70%;
  margin-bottom: 10px;

  i {
    font-size: 50px;
  }

  .button-text {
    margin-top: 5px;
    font-size: 20px;
  }
}

.switch-text {
  user-select: none;
  font-weight: 800;
  font-size: medium;
}

.parameter-control-and-line-tips {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: auto;
  height: 100%;
  /* background-color: beige; */

  .parameter-control {
    height: 100%;
    width: 50%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;

    .bubble-control {
      height: 100%;
      width: auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .btn-group {
        display: flex;
        flex-direction: row;

        .el-button {
          width: 20px;
          height: 20px;
          line-height: 0px;
          text-align: center;
        }
      }
    }

    .margin-control {
      height: 100%;
      width: auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .btn-group {
        display: flex;
        flex-direction: row;

        .el-button {
          width: 20px;
          height: 20px;
          line-height: 0px;
          text-align: center;
        }
      }
    }
  }
}

.line-tips {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-around;
  border-left: 1px solid grey;
  background-color: #869297;
  width: 350px;
  font-weight: 700;
  user-select: none;
}

.line-tips div {
  display: flex;
  align-items: center;
}

.line-name {
  display: flex;
  justify-content: space-between;
  width: 70px;
  margin-left: 5px;
}

.line {
  display: flex;
  width: 100%;
  align-items: center;
}

.line::before {
  content: "----------------------------------";
  flex-grow: 1;
}

#canvas {
  justify-content: center;
  width: 100%;
  height: 450px;
}

.shape-option {
  position: absolute;
  left: 0px;
}

#axisInfo {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 10px;
  right: 10px;
  width: auto;
  height: auto;
  /* background-color: snow; */
}

#lineInfo {
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: 70px;
  left: 20px;
  width: auto;
  height: auto;
}

.tissue-fluid-level {
  position: absolute;
  right: 20px;
  top: 40px;
  /* 设置旋转的原点为右下角 */
  transform-origin: 100% 100%;
  /* 使用 rotate() 函数将进度条旋转为竖直方向 */
  transform: rotate(-90deg);
}

.red-point-info {
  position: absolute;
  bottom: 0px;
  left: 0px;
  display: flex;
  flex-direction: row;
  background-color: rgb(134, 146, 151);

  .red-point {
    margin-left: 20px;
    margin-right: 20px;

    .point-index {
      color: rgb(197, 197, 197);
      font-weight: bold;
    }
  }


}

.progress-bar {
  width: 300px;
  height: 30px;
}

.select-item {
  display: flex;
  flex-direction: row;
  height: 33.33%;
  width: 100%;
  border: 1px solid grey;
}

.scale {
  user-select: none;
  font-size: 20px;
  padding-left: 5px;
}

.item-head {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 25%;
  border-left: 1px solid grey;

  .head-content {
    height: auto;
    width: 50px;
    font-size: 25px;
  }
}

.item-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 75%;

  .title {
    font-size: 20px;
    margin-left: 20px;
    margin-right: 20px;
    user-select: none;
  }

  .child {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: auto;
    margin-top: auto;
    margin-bottom: auto;
  }


}
</style>