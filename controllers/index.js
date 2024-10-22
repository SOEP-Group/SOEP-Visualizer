const { time } = require('console');
const path = require('path');
const pool = require('../db');

exports.Home = async function(req, res){
  return res.render("index"); 
}

exports.Dynamic = async function(req, res){
  // process.env.INIT_CWD is the root folder
  return res.sendFile(path.join(process.env.INIT_CWD, 'views/test.html')); 
}

// New controller function to render the template with data
exports.RenderSatellite = async function(req, res) {
  // Example data to pass to the EJS template
  const satelliteData = {
    name: 'Hubble Space Telescope',
    launchDate: 'April 24, 1990',
    orbitType: 'Low Earth Orbit'
  };

  // Render the EJS template (e.g., satellite.ejs) with the data
  res.render('satellite', satelliteData); // Ensure 'satellite.ejs' is inside the 'views' folder
}

const mockSatelliteData = {
    'satellite_1': {
        name: 'Satellite Alpha',
        speed: 'Super fast',
        position: 'N 6504089, E 278978',
        launchDate: '2020-01-01',
    },
    'satellite_2': {
        name: 'Satellite Beta',
        speed: 'Super fast',
        position: 'N 5489223, E 854213',
        launchDate: '2021-05-15',
    },
    'satellite_3': {
        name: 'Satellite C',
        speed: 'Super fast',
        position: 'N 5648215, E 458512',
        launchDate: '2022-12-15',
    },
    'satellite_4': {
      name: 'Satellite Delta',
      speed: 'Super duper fast',
      position: 'N 7345643, E 548223',
      launchDate: '2015-12-15',
  },
};

exports.getSatelliteInfo = (req, res) => {
  const satelliteId = req.params.id;
  // Fetch real satellite data in future
  // time.sleep
  // const satelliteData = mockSatelliteData[satelliteId]
  // if (satelliteData) {
  //     res.json(satelliteData);
  // } else {
  //   res.status(404).json({ error: 'Satellite not found' });
  // }
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  delay(2000).then(() => {
    const satelliteData = mockSatelliteData[satelliteId];
    if (satelliteData) {
        res.json(satelliteData);
    } else {
        res.status(404).json({ error: 'Satellite not found' });
    }
  }).catch(error => {
    console.error('Error in delay:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });
};


exports.getOrbitData = (req, res) => {
  const satelliteId = req.params.id;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  delay(200).then(() => {
    let orbitData = null
    mockOrbitData.forEach((satelliteData) => {
      if (satelliteData.satelliteName === satelliteId) {
        orbitData = satelliteData.orbit;
      }
  });
    if (orbitData) {
        res.json(orbitData);
    } else {
        res.status(404).json({ error: 'Satellite not found' });
    }
  }).catch(error => {
    console.error('Error in delay:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });
};


const mockOrbitData = [{satelliteName: "satellite_4", orbit: [
  { tsince: 0,   position: { x: 3789.221, y: 2012.590, z: -5277.248 }, velocity: { xdot: -4.464, ydot: 6.152, zdot: -0.853 } },
  { tsince: 1,   position: { x: 3512.984, y: 2376.843, z: -5316.371 }, velocity: { xdot: -4.741, ydot: 5.985, zdot: -0.450 } },
  { tsince: 2,   position: { x: 3220.776, y: 2730.290, z: -5331.255 }, velocity: { xdot: -4.996, ydot: 5.792, zdot: -0.046 } },
  { tsince: 3,   position: { x: 2913.923, y: 3071.323, z: -5321.829 }, velocity: { xdot: -5.229, ydot: 5.572, zdot: 0.360 } },
  { tsince: 4,   position: { x: 2593.819, y: 3398.389, z: -5288.132 }, velocity: { xdot: -5.438, ydot: 5.326, zdot: 0.763 } },
  { tsince: 5,   position: { x: 2261.917, y: 3709.997, z: -5230.312 }, velocity: { xdot: -5.622, ydot: 5.057, zdot: 1.163 } },
  { tsince: 6,   position: { x: 1919.724, y: 4004.725, z: -5148.628 }, velocity: { xdot: -5.780, ydot: 4.764, zdot: 1.558 } },
  { tsince: 7,   position: { x: 1568.795, y: 4281.228, z: -5043.445 }, velocity: { xdot: -5.913, ydot: 4.449, zdot: 1.946 } },
  { tsince: 8,   position: { x: 1210.724, y: 4538.241, z: -4915.236 }, velocity: { xdot: -6.018, ydot: 4.114, zdot: 2.326 } },
  { tsince: 9,   position: { x: 847.139,  y: 4774.586, z: -4764.579 }, velocity: { xdot: -6.097, ydot: 3.761, zdot: 2.694 } },
  { tsince: 10,  position: { x: 479.694,  y: 4989.177, z: -4592.151 }, velocity: { xdot: -6.147, ydot: 3.390, zdot: 3.051 } },
  { tsince: 11,  position: { x: 110.063,  y: 5181.028, z: -4398.732 }, velocity: { xdot: -6.169, ydot: 3.003, zdot: 3.394 } },
  { tsince: 12,  position: { x: -260.069, y: 5349.252, z: -4185.198 }, velocity: { xdot: -6.164, ydot: 2.602, zdot: 3.721 } },
  { tsince: 13,  position: { x: -629.015, y: 5493.072, z: -3952.514 }, velocity: { xdot: -6.130, ydot: 2.190, zdot: 4.032 } },
  { tsince: 14,  position: { x: -995.090, y: 5611.819, z: -3701.738 }, velocity: { xdot: -6.068, ydot: 1.767, zdot: 4.324 } },
  { tsince: 15,  position: { x: -1356.620, y: 5704.937, z: -3434.008 }, velocity: { xdot: -5.978, ydot: 1.336, zdot: 4.597 } },
  { tsince: 16,  position: { x: -1711.952, y: 5771.989, z: -3150.543 }, velocity: { xdot: -5.861, ydot: 0.898, zdot: 4.848 } },
  { tsince: 17,  position: { x: -2059.458, y: 5812.654, z: -2852.634 }, velocity: { xdot: -5.718, ydot: 0.457, zdot: 5.078 } },
  { tsince: 18,  position: { x: -2397.544, y: 5826.735, z: -2541.642 }, velocity: { xdot: -5.548, ydot: 0.013, zdot: 5.284 } },
  { tsince: 19,  position: { x: -2724.659, y: 5814.152, z: -2218.985 }, velocity: { xdot: -5.352, ydot: -0.432, zdot: 5.467 } },
  { tsince: 20,  position: { x: -3039.301, y: 5774.953, z: -1886.142 }, velocity: { xdot: -5.132, ydot: -0.874, zdot: 5.624 } },
  { tsince: 21,  position: { x: -3340.022, y: 5709.304, z: -1544.635 }, velocity: { xdot: -4.888, ydot: -1.313, zdot: 5.755 } },
  { tsince: 22,  position: { x: -3625.440, y: 5617.496, z: -1196.030 }, velocity: { xdot: -4.622, ydot: -1.746, zdot: 5.860 } },
  { tsince: 23,  position: { x: -3894.240, y: 5499.938, z: -841.928 }, velocity: { xdot: -4.335, ydot: -2.171, zdot: 5.939 } },
  { tsince: 24,  position: { x: -4145.184, y: 5357.162, z: -483.955 }, velocity: { xdot: -4.027, ydot: -2.586, zdot: 5.989 } },
  { tsince: 25,  position: { x: -4377.114, y: 5189.815, z: -123.755 }, velocity: { xdot: -3.701, ydot: -2.990, zdot: 6.013 } },
  { tsince: 26,  position: { x: -4588.963, y: 4998.656, z: 237.014 }, velocity: { xdot: -3.358, ydot: -3.380, zdot: 6.008 } },
  { tsince: 27,  position: { x: -4779.753, y: 4784.559, z: 596.692 }, velocity: { xdot: -2.999, ydot: -3.754, zdot: 5.976 } },
  { tsince: 28,  position: { x: -4948.605, y: 4548.501, z: 953.623 }, velocity: { xdot: -2.627, ydot: -4.111, zdot: 5.917 } },
  { tsince: 29,  position: { x: -5094.740, y: 4291.562, z: 1306.165 }, velocity: { xdot: -2.242, ydot: -4.450, zdot: 5.830 } },
  { tsince: 30,  position: { x: -5217.484, y: 4014.921, z: 1652.692 }, velocity: { xdot: -1.847, ydot: -4.768, zdot: 5.717 } },
  { tsince: 31, position: { x: -5316.273555901056, y: 3719.8462960100424, z: 1991.6099978137213 }, velocity: { xdot: -1.4441843005860429, ydot: -5.064111287855135, zdot: 5.576499724608078 } },
  { tsince: 32, position: { x: -5390.65354511847, y: 3407.6920275081834, z: 2321.357120490966 }, velocity: { xdot: -1.034203445525273, ydot: -5.33703354330693, zdot: 5.410878307135047 } },
  { tsince: 33, position: { x: -5440.2830715301525, y: 3079.8917956539262, z: 2640.4155398820644 }, velocity: { xdot: -0.6194878787186814, ydot: -5.585443030642894, zdot: 5.220348499242985 } },
  { tsince: 34, position: { x: -5464.935529212669, y: 2737.9513699780973, z: 2947.316763228482 }, velocity: { xdot: -0.20195613345945465, ydot: -5.8081932994731265, zdot: 5.005796464394353 } },
  { tsince: 35, position: { x: -5464.499820598615, y: 2383.4416942502266, z: 3240.64885804995 }, velocity: { xdot: 0.21646173047125514, ydot: -6.004259150250558, zdot: 4.768220492481058 } },
  { tsince: 36, position: { x: -5438.980765711942, y: 2017.9914693349094, z: 3519.0630270007496 }, velocity: { xdot: 0.6338335149076858, ydot: -6.172741223680027, zdot: 4.508725802108467 } },
  { tsince: 37, position: { x: -5388.498950230319, y: 1643.2794818071252, z: 3781.279855300699 }, velocity: { xdot: 1.048234183211897, ydot: -6.312869884750143, zdot: 4.228518838098703 } },
  { tsince: 38, position: { x: -5313.290019417731, y: 1261.0267208268365, z: 4026.095201939185 }, velocity: { xdot: 1.4577550159895596, ydot: -6.424008398670043, zdot: 3.928901115768516 } },
  { tsince: 39, position: { x: -5213.703428182183, y: 872.9883257093388, z: 4252.385708992911 }, velocity: { xdot: 1.8605125722102394, ydot: -6.505655403407739, zdot: 3.611262664371955 } },
  { tsince: 40, position: { x: -5090.2005696573615, y: 480.94514231861797, z: 4459.1140384017635 }, velocity: { xdot: 2.254657672417027, ydot: -6.557446714688225, zdot: 3.2770748924159743 } },
  { tsince: 41, position: { x: -4943.352826725219, y: 86.69651146546116, z: 4645.3330116829275 }, velocity: { xdot: 2.638382792448742, ydot: -6.579156311902694, zdot: 2.9278842915998315 } },
  { tsince: 42, position: { x: -4773.838281164477, y: -307.9496225280789, z: 4810.190683565169 }, velocity: { xdot: 3.009931787705957, ydot: -6.57069699678984, zdot: 2.565303636709239 } },
  { tsince: 43, position: { x: -4582.438757779012, y: -701.1839815704506, z: 4952.933560754142 }, velocity: { xdot: 3.367606631134287, ydot: -6.5321200535738155, zdot: 2.1910052125560444 } },
  { tsince: 44, position: { x: -4370.036020663407, y: -1091.2045061986591, z: 5072.910069594164 }, velocity: { xdot: 3.709775128579362, ydot: -6.463614507976542, zdot: 1.8067127712011564 } },
  { tsince: 45, position: { x: -4137.607608783414, y: -1476.2245812706415, z: 5169.573404952446 }, velocity: { xdot: 4.034877996957987, ydot: -6.3655057627270395, zdot: 1.4141935802727186 } },
  { tsince: 46, position: { x: -3886.2222585122845, y: -1854.4811629258177, z: 5242.48389910127 }, velocity: { xdot: 4.341435561513073, ydot: -6.238253680211712, zdot: 1.0152503761239569 } },
  { tsince: 47, position: { x: -3617.034936272549, y: -2224.2427743576436, z: 5291.310905822982 }, velocity: { xdot: 4.628054063928525, ydot: -6.0824501367869885, zdot: 0.6117132503706935 } },
  { tsince: 48, position: { x: -3331.281504780804, y: -2583.817339476456, z: 5315.834196586354 }, velocity: { xdot: 4.893431575286709, ydot: -5.898816071175863, zdot: 0.2054314944708242 } },
  { tsince: 49, position: { x: -3030.273046708176, y: -2931.559824791122, z: 5315.9448669926505 }, velocity: { xdot: 5.136363508926618, ydot: -5.688198046765264, zdot: -0.20173457620527332 } },
  { tsince: 50, position: { x: -2715.3898698411763, y: -3265.8796609436613, z: 5291.645752871777 }, velocity: { xdot: 5.355747728401051, ydot: -5.4515643447418265, zdot: -0.6079217999060363 } },
  { tsince: 51, position: { x: -2388.07499480216, y: -3585.2481250692845, z: 5243.05131577205 }, velocity: { xdot: 5.550589367220495, ydot: -5.190000418599971, zdot: -1.0112725995598402 } },
  { tsince: 52, position: { x: -2049.8284831635383, y: -3888.2043927540803, z: 5170.387227323297 }, velocity: { xdot: 5.720004602742961, ydot: -4.904704806786105, zdot: -1.4099420326545227 } },
  { tsince: 53, position: { x: -1702.1993165576014, y: -4173.363421927843, z: 5073.989124986792 }, velocity: { xdot: 5.8632252945676715, ydot: -4.5969828385339575, zdot: -1.802107497622872 } },
  { tsince: 54, position: { x: -1346.7792466266305, y: -4439.421355553115, z: 4954.301194886781 }, velocity: { xdot: 5.979601860355222, ydot: -4.268241651615144, zdot: -2.185975664635615 } },
  { tsince: 55, position: { x: -985.1953670865378, y: -4685.161659021044, z: 4811.874137588007 }, velocity: { xdot: 6.068606378397909, ydot: -3.919983936347118, zdot: -2.559790678366516 } },
  { tsince: 56, position: { x: -619.1027371684288, y: -4909.460660705014, z: 4647.36268553857 }, velocity: { xdot: 6.129835082562676, ydot: -3.5538014325254697, zdot: -2.9218419825877158 } },
  { tsince: 57, position: { x: -250.17686961737547, y: -5111.292690333516, z: 4461.522654737136 }, velocity: { xdot: 6.16301036972982, ydot: -3.171368019779654, zdot: -3.270472013493947 } },
  { tsince: 58, position: { x: 119.89388688536559, y: -5289.734791008332, z: 4255.207539237111 }, velocity: { xdot: 6.167982299091171, ydot: -2.7744324110819503, zdot: -3.6040837335958007 } },
  { tsince: 59, position: { x: 489.4160397130564, y: -5443.970981349373, z: 4029.3646589174123 }, velocity: { xdot: 6.144729561565915, ydot: -2.3648104621997215, zdot: -3.9211479744133415 } },
  { tsince: 60, position: { x: 856.6986862002146, y: -5573.296045122344, z: 3785.0308729868475 }, velocity: { xdot: 6.093359897312139, ydot: -1.9443771138494792, zdot: -4.22021055263888 } },
  { tsince: 61, position: { x: 1220.0612556458925, y: -5677.118826847067, z: 3523.327873940309 }, velocity: { xdot: 6.014109939975927, ydot: -1.5150579880718653, zdot: -4.499899121131642 } },
  { tsince: 62, position: { x: 1577.8414620226135, y: -5754.96505674548, z: 3245.456887653217 }, velocity: { xdot: 5.907344387289605, ydot: -1.0788203713310156, zdot: -4.758929879774012 } },
  { tsince: 63, position: { x: 1928.40199981188, y: -5806.479408605293, z: 2952.6939386095105 }, velocity: { xdot: 5.773554947438939, ydot: -0.6376653807849595, zdot: -4.996113088553271 } },
  { tsince: 64, position: { x: 2270.1395368086705, y: -5831.427514168002, z: 2646.382879326783 }, velocity: { xdot: 5.613357927412709, ydot: -0.19361695099323134, zdot: -5.210359909787522 } },
  { tsince: 65, position: { x: 2601.4911632073913, y: -5829.696875444428, z: 2327.929939386158 }, velocity: { xdot: 5.427491888178885, ydot: 0.25128645804223093, zdot: -5.40068705684387 } },
  { tsince: 66, position: { x: 2920.9418713565433, y: -5801.297491884019, z: 1998.7970507773994 }, velocity: { xdot: 5.216814334922666, ydot: 0.6950017626933103, zdot: -5.5662218480637815 } },
  { tsince: 67, position: { x: 3227.0315795557394, y: -5746.361846452131, z: 1660.4950775784025 }, velocity: { xdot: 4.982297838937831, ydot: 1.135490964020341, zdot: -5.706206552008529 } },
  { tsince: 68, position: { x: 3518.361904280542, y: -5665.144307576104, z: 1314.5768018934923 }, velocity: { xdot: 4.725025539144478, ydot: 1.5707308930706494, zdot: -5.820002164983647 } },
  { tsince: 69, position: { x: 3793.6026441070026, y: -5558.019946688201, z: 962.6297012775718 }, velocity: { xdot: 4.446186040829438, ydot: 1.9987229297408013, zdot: -5.907091585108951 } },
  { tsince: 70, position: { x: 4051.497939898569, y: -5425.482774988333, z: 606.268554848027 }, velocity: { xdot: 4.147067736526814, ydot: 2.4175026294052224, zdot: -5.967082152285611 } },
  { tsince: 71, position: { x: 4290.8720775458905, y: -5268.14340704206, z: 247.12791692099395 }, velocity: { xdot: 3.8290525811560907, ydot: 2.8251491903678536, zdot: -5.999707529393678 } },
  { tsince: 72, position: { x: 4510.634901688316, y: -5086.726162849192, z: -113.14550172852996 }, velocity: { xdot: 3.493609360396328, ydot: 3.2197946953386962, zdot: -6.004828906773499 } },
  { tsince: 73, position: { x: 4709.786811388054, y: -4882.065623977193, z: -472.90050405596963 }, velocity: { xdot: 3.142286497554569, ydot: 3.599633061636526, zdot: -5.982435519322395 } },
  { tsince: 74, position: { x: 4887.423423324443, y: -4655.102503742461, z: -830.4893257488874 }, velocity: { xdot: 2.7767042001599274, ydot: 3.962928875302442, zdot: -5.932644430633452 } },
  { tsince: 75, position: { x: 5042.7391940434245, y: -4406.879797236341, z: -1184.2743265571412 }, velocity: { xdot: 2.3985474910752833, ydot: 4.308024611815203, zdot: -5.855699825933853 } },
  { tsince: 76, position: { x: 5175.031733092494, y: -4138.536916181092, z: -1532.6370079445953 }, velocity: { xdot: 2.0095564801792527, ydot: 4.633349818135691, zdot: -5.751971279060237 } },
  { tsince: 77, position: { x: 5283.704406469239, y: -3851.3048848291396, z: -1873.9845168890063 }, velocity: { xdot: 1.6115188454950138, ydot: 4.93742733199243, zdot: -5.621951681596084 } },
  { tsince: 78, position: { x: 5368.2690431853525, y: -3546.500380701157, z: -2206.7572022031436 }, velocity: { xdot: 1.2062609282686303, ydot: 5.218880184658832, zdot: -5.466254405198032 } },
  { tsince: 79, position: { x: 5428.347992017491, y: -3225.519538525448, z: -2529.435743493943 }, velocity: { xdot: 0.7956389573666398, ydot: 5.476437669068105, zdot: -5.285609893365248 } },
  { tsince: 80, position: { x: 5463.6756500195015, y: -2889.8314084013377, z: -2840.5480589094004 }, velocity: { xdot: 0.38153022299275496, ydot: 5.708940797874799, zdot: -5.080861696086817 } },
  { tsince: 81, position: { x: 5474.099461498859, y: -2540.9711052693056, z: -3138.6759595019153 }, velocity: { xdot: -0.03417574232498246, ydot: 5.915347134692455, zdot: -4.852961989157367 } },
  { tsince: 82, position: { x: 5459.580389526057, y: -2180.5326875414794, z: -3422.4615206176272 }, velocity: { xdot: -0.4495859211531324, ydot: 6.094734989546182, zdot: -4.602966622969182 } },
  { tsince: 83, position: { x: 5420.192865169049, y: -1810.1618030612424, z: -3690.613143453513 }, velocity: { xdot: -0.8628124571726291, ydot: 6.246306977002548, zdot: -4.3320297474362395 } },
  { tsince: 84, position: { x: 5356.124222477183, y: -1431.5481404551597, z: -3941.9112827318704 }, velocity: { xdot: -1.271981145212203, ydot: 6.3693929422521185, zdot: -4.041398060377223 } },
  { tsince: 85, position: { x: 5267.673562344729, y: -1046.4174634082974, z: -4175.21396942788 }, velocity: { xdot: -1.6752399944404632, ydot: 6.4634523196741025, zdot: -3.732404513172885 } },
  { tsince: 86, position: { x: 5155.25044642441, y: -656.5248222796045, z: -4389.461195974051 }, velocity: { xdot: -2.0707662179666424, ydot: 6.5280756009332555, zdot: -3.406462786384092 } },
  { tsince: 87, position: { x: 5019.372504527031, y: -263.6450922863878, z: -4583.680465551447 }, velocity: { xdot: -2.456775669975676, ydot: 6.562985830618668, zdot: -3.065059437966705 } },
  { tsince: 88, position: { x: 4860.6631588049, y: 130.43395733764012, z: -4756.990360256044 }, velocity: { xdot: -2.8315292960920035, ydot: 6.568038889932872, zdot: -2.7097479116015055 } },
  { tsince: 89, position: { x: 4679.848631985369, y: 523.9198976514455, z: -4908.604496719395 }, velocity: { xdot: -3.1933406522864027, ydot: 6.543223589116586, zdot: -2.3421413600027647 } },
  { tsince: 90, position: { x: 4477.7545809342, y: 915.0236039224549, z: -5037.83489629713 }, velocity: { xdot: -3.54058284963691, ydot: 6.488661175972801, zdot: -1.9639055343579668 } },
  { tsince: 91, position: { x: 4255.30232268635, y: 1301.9671754037383, z: -5144.094925107535 }, velocity: { xdot: -3.8716951910591617, ydot: 6.404604357859534, zdot: -1.5767515655084097 } },
  { tsince: 92, position: { x: 4013.504671546066, y: 1682.9917824152792, z: -5226.901798109638 }, velocity: { xdot: -4.185189496820828, ydot: 6.291435860006728, zdot: -1.182428659128993 } },
  { tsince: 93, position: { x: 3753.461405961291, y: 2056.365413505563, z: -5285.878642637452 }, velocity: { xdot: -4.479656117965096, ydot: 6.149666540474136, zdot: -0.7827167228287982 } },
  { tsince: 94, position: { x: 3476.3543839032995, y: 2420.390496573476, z: -5320.75611776365 }, velocity: { xdot: -4.753769637988603, ydot: 5.979933078854205, zdot: -0.37941893924316755 } },
  { tsince: 95, position: { x: 3183.44232544913, y: 2773.411368764726, z: -5331.373586618544 }, velocity: { xdot: -5.0062942633274385, ydot: 5.782995252135672, zdot: 0.025645704083583652 } },
  { tsince: 96, position: { x: 2876.0550705891374, y: 3113.82179433978, z: -5317.679822035642 }, velocity: { xdot: -5.236089048623561, ydot: 5.569098701192644, zdot: 0.43292769872671665 } },
  { tsince: 97, position: { x: 2554.038093755991, y: 3444.944387798537, z: -5282.378878079083 }, velocity: { xdot: -5.453238310130733, ydot: 5.334704522592647, zdot: 0.8379653252821681 } },
  { tsince: 98, position: { x: 2218.6767246687856, y: 3763.453683581557, z: -5230.911826474846 }, velocity: { xdot: -5.658200872312407, ydot: 5.080792256217062, zdot: 1.2394061251706923 } },
  { tsince: 99, position: { x: 1869.5651628931888, y: 4070.1766477791826, z: -5167.999074372174 }, velocity: { xdot: -5.850634311484981, ydot: 4.809802390309122, zdot: 1.6367872218663395 } },
  { tsince: 100, position: { x: 1507.1543362046443, y: 4366.723754926594, z: -5097.569326640357 }, velocity: { xdot: -6.030255015069663, ydot: 4.525280691557365, zdot: 2.029661271780094 } },
  { tsince: 101, position: { x: 1131.7485327302762, y: 4654.081913131043, z: -5015.853797091223 }, velocity: { xdot: -6.19782613850454, ydot: 4.2282941171588345, zdot: 2.426029059115225 } },
  { tsince: 102, position: { x: 746.0750603114544, y: 4933.074013963113, z: -4920.704081059697 }, velocity: { xdot: -6.353077250282706, ydot: 3.920329013631847, zdot: 2.8260570074568925 } },
  { tsince: 103, position: { x: 348.47791651487176, y: 5204.077056325365, z: -4812.696428880056 }, velocity: { xdot: -6.496635947928728, ydot: 3.6023722927625734, zdot: 3.229517310252352 } },
  { tsince: 104, position: { x: -62.288514669576596, y: 5467.278075797419, z: -4691.387450680687 }, velocity: { xdot: -6.628883078958116, ydot: 3.275095553286254, zdot: 3.636413563291262 } },
  { tsince: 105, position: { x: -471.8497555587126, y: 5722.275184194046, z: -4558.509697289382 }, velocity: { xdot: -6.749166530283991, ydot: 2.939715289756558, zdot: 4.046707718505108 } },
  { tsince: 106, position: { x: -884.232185738008, y: 5968.235314321982, z: -4414.703092575623 }, velocity: { xdot: -6.857378746407178, ydot: 2.5960564465657123, zdot: 4.460388044422464 } },
  { tsince: 107, position: { x: -1290.0988045715637, y: 6205.637054164285, z: -4260.872186586733 }, velocity: { xdot: -6.953330043007475, ydot: 2.2442574635067433, zdot: 4.877441267205765 } },
  { tsince: 108, position: { x: -1690.052611733979, y: 6434.476542368446, z: -4097.4513027862885 }, velocity: { xdot: -7.036514284649893, ydot: 1.8844904457336638, zdot: 5.298855739303389 } },
  { tsince: 109, position: { x: -2084.6496842116063, y: 6654.018801739456, z: -3916.2510526263674 }, velocity: { xdot: -7.107406529154204, ydot: 1.5168022238388722, zdot: 5.723611711849335 } },
  { tsince: 110, position: { x: -2474.4635439882255, y: 6864.56050039168, z: -3728.3601566828147 }, velocity: { xdot: -7.16612949623134, ydot: 1.1412455910128892, zdot: 6.151673734136626 } },
  { tsince: 111, position: { x: -2859.1429183133523, y: 7065.538048646612, z: -3534.8966818701085 }, velocity: { xdot: -7.212486291720373, ydot: 0.7577483849721953, zdot: 6.584032721408676 } },
  { tsince: 112, position: { x: -3238.2897651687214, y: 7256.888305182256, z: -3336.894908068716 }, velocity: { xdot: -7.246396578520785, ydot: 0.36637847744582876, zdot: 7.020727783891362 } },
  { tsince: 113, position: { x: -3609.7339641866744, y: 7438.916492568506, z: -3129.4396694427683 }, velocity: { xdot: -7.268852665329798, ydot: -0.031639495068155207, zdot: 7.460898379812644 } },
  { tsince: 114, position: { x: -3975.468671113684, y: 7609.737809934452, z: -2914.5353747681047 }, velocity: { xdot: -7.279837705467048, ydot: -0.4428313376049169, zdot: 7.904520551192824 } },
  { tsince: 115, position: { x: -4334.293021693233, y: 7769.560154836356, z: -2700.6922227459986 }, velocity: { xdot: -7.27935351342574, ydot: -0.8624993760813904, zdot: 8.351517084959465 } },
  { tsince: 116, position: { x: -4686.075582894598, y: 7918.461071623836, z: -2489.027843903541 }, velocity: { xdot: -7.267392719041313, ydot: -1.2905464386812655, zdot: 8.80186825203149 } },
  { tsince: 117, position: { x: -5029.687529597477, y: 8056.525518958214, z: -2279.9368013109243 }, velocity: { xdot: -7.244926272085352, ydot: -1.7185847163880427, zdot: 9.255550701978562 } },
  { tsince: 118, position: { x: -5365.013393024611, y: 8183.795560721751, z: -2073.931015604927 }, velocity: { xdot: -7.211948327408305, ydot: -2.156658360629609, zdot: 9.712579507434968 } },
  { tsince: 119, position: { x: -5691.994494220167, y: 8299.24951036787, z: -1871.0064489008162 }, velocity: { xdot: -7.166298486679641, ydot: -2.605718496360357, zdot: 10.172926505121607 } },
]}];

// Temp
exports.getAllSatellites = function (req, res) {
  pool.query('SELECT * FROM satellites')
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error('Error fetching satellites:', err);
      res.status(500).send('Error fetching satellites.');
    });
};

