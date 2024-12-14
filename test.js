(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [405],
  {
    8312: function (e, t, i) {
      (window.__NEXT_P = window.__NEXT_P || []).push([
        "/",
        function () {
          return i(6133);
        },
      ]);
    },
    6133: function (e, t, i) {
      "use strict";
      let s;
      i.r(t),
        i.d(t, {
          default: function () {
            return tI;
          },
        });
      var n = i(5893),
        r = i(7294),
        a = i(2946);
      let l = (e) => {
        let t = e.count > 1 ? " (".concat(e.no, "/").concat(e.count, ")") : "";
        return e.title + t;
      };
      var o = i(9542),
        h = i(9477);
      let c = -Math.PI / 2,
        d = (e) =>
          !!e &&
          "boolean" != typeof e &&
          !isNaN(e.x) &&
          !isNaN(e.y) &&
          !isNaN(e.z),
        u = (e) => Math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z),
        C = (e) => parseInt(e).toString(),
        p = (e) => 3600 * e,
        x = new Intl.NumberFormat("en-US", {
          style: "decimal",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }),
        g = new Intl.NumberFormat("en-US", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        m = (e) => x.format(e),
        f = (e) => g.format(e),
        w = (e) => "".concat(f(e), "\xb0"),
        v = (e) => "".concat(m(e), " km"),
        j = (e) => "".concat(m(e), " km/h"),
        y = (e) => {
          let t = e
              .toLowerCase()
              .replace(/[\/\\:*?"<>|]/g, "")
              .replace(/\s+/g, "_")
              .replace(/[()]/g, ""),
            i = "starlink",
            s = "oneweb";
          return t.includes(i) ? i : t.includes(s) ? s : t;
        };
      function _(e, t, i) {
        return !e || !e.length || !t || !t.length || !i || !i.length;
      }
      function b(e) {
        return e.startsWith("0 ") ? e.substring(2, e.length) : e;
      }
      let Z = (e) => {
          try {
            let r = e.split(/\r?\n/),
              l = new Map();
            for (let e = 0; e < r.length; e += 3) {
              let t = r[e],
                i = r[e + 1],
                s = r[e + 2];
              if (_(t, i, s)) continue;
              let n = b(t),
                a = l.get(n);
              a
                ? l.set(n, { currentNo: 0, totalCount: a.totalCount + 1 })
                : l.set(n, { currentNo: 0, totalCount: 1 });
            }
            let o = [],
              h = [];
            for (let e = 0; e < r.length; e += 3) {
              var t, i, s, n;
              let c = r[e],
                d = r[e + 1],
                u = r[e + 2];
              if (_(c, d, u)) continue;
              let C = b(c),
                p = l.get(C),
                x =
                  (null !== (t = null == p ? void 0 : p.currentNo) &&
                  void 0 !== t
                    ? t
                    : 0) + 1;
              l.set(C, {
                currentNo: x,
                totalCount:
                  null !== (i = null == p ? void 0 : p.totalCount) &&
                  void 0 !== i
                    ? i
                    : 1,
              });
              let g = a.YX(d, u);
              !(n = a.a0(g, new Date())).position ||
                "boolean" == typeof n.position ||
                isNaN(n.position.x) ||
                isNaN(n.position.y) ||
                isNaN(n.position.z) ||
                (o.push({
                  title: C.trim(),
                  line1: d,
                  line2: u,
                  no: x,
                  count:
                    null !== (s = null == p ? void 0 : p.totalCount) &&
                    void 0 !== s
                      ? s
                      : 1,
                }),
                h.push(g));
            }
            let c = M(o),
              d = S(h);
            return {
              tles: o,
              satRecs: h,
              noradIdToIndex: d,
              displayNameToIndex: c,
            };
          } catch (e) {
            throw (console.log(e), e);
          }
        },
        M = (e) => {
          let t = new Map();
          for (let i = 0; i < e.length; i++) {
            let s = l(e[i]);
            t.set(s, i);
          }
          return t;
        },
        S = (e) => {
          let t = new Map();
          for (let i = 0; i < e.length; i++) {
            let s = C(e[i].satnum);
            t.set(s, i);
          }
          return t;
        };
      class P {
        get mousePositionDOM() {
          return this._mousePositionDOM;
        }
        get mousePosition() {
          return this._mousePosition;
        }
        get isMouseUpThisFrame() {
          return this._isMouseUpThisFrame;
        }
        get isOverCanvas() {
          return this._isOverCanvas;
        }
        get isUsingMouse() {
          return this._isUsingMouse;
        }
        frameEnded() {
          this._isMouseUpThisFrame = !1;
        }
        onMouseMove(e) {
          (this._isUsingMouse = "mouse" === e.pointerType),
            this.updateMousePosition(e);
        }
        onMouseUp(e) {
          Math.abs(this._mouseDownStartX - e.clientX) +
            Math.abs(this._mouseDownStartY - e.clientY) <=
            this._minDragDelta && (this._isMouseUpThisFrame = !0),
            this.updateMousePosition(e);
        }
        onMouseDown(e) {
          (this._mouseDownStartX = e.clientX),
            (this._mouseDownStartY = e.clientY),
            this.updateMousePosition(e);
        }
        updateMousePosition(e) {
          var t;
          let { clientX: i, clientY: s } = e;
          (null === (t = document.elementFromPoint(i, s)) || void 0 === t
            ? void 0
            : t.parentElement) === this.parent &&
            ((this._isOverCanvas = !0), e.preventDefault());
          let n = this.parent.getBoundingClientRect(),
            r = i - n.left,
            a = s - n.top;
          (this._mousePositionDOM.x = r),
            (this._mousePositionDOM.y = a),
            (this._mousePosition.x = (r / n.width) * 2 - 1),
            (this._mousePosition.y = -((a / n.height) * 2) + 1);
        }
        constructor(e) {
          (this._minDragDelta = 1),
            (this._mousePositionDOM = new h.FM8(0, 0)),
            (this._mousePosition = new h.FM8(1, 1)),
            (this._isMouseUpThisFrame = !1),
            (this._isOverCanvas = !1),
            (this._isUsingMouse = !1),
            (this.parent = e),
            e.addEventListener("mouseup", (e) => this.onMouseUp(e)),
            e.addEventListener("pointermove", (e) => this.onMouseMove(e)),
            e.addEventListener("mousedown", (e) => this.onMouseDown(e));
        }
      }
      var L = i(9365);
      class I extends L.z {
        setActive(e) {
          this.enabled = e;
        }
        customUpdate(e, t) {
          this.update(e);
        }
        resize() {}
        onSelectedSatelliteChanged(e, t) {
          this.selectedSatellite = e.detail;
        }
        constructor(e, t) {
          super(e, t),
            (this.earthPosition = new h.Pa4()),
            (this.minDistance = 20),
            (this.maxDistance = 1e4),
            (this.enableDamping = !0),
            (this.enablePan = !1),
            (this.target = this.earthPosition);
        }
      }
      var k = i(9753);
      class R extends k.$ {
        setActive(e) {
          this.enabled = e;
        }
        updateTarget(e) {
          e &&
            (this.rotationMatrix.lookAt(
              this.object.position,
              e,
              this.object.up
            ),
            this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix),
            this.targetPosition.copy(e));
        }
        customUpdate(e, t) {
          if (this.satData) {
            if ((t && this.updateTarget(t), this.isLerping)) {
              this.elapsedLerpTime += e;
              let t = this.elapsedLerpTime / this.lerpDurationMs,
                i = Math.sin((t * Math.PI) / 2);
              if (t >= 1)
                this.target.copy(this.targetPosition),
                  (this.isLerping = !1),
                  (this.enabled = !0),
                  (this.lerpDurationMs = 500);
              else if (
                (this.object.quaternion.slerpQuaternions(
                  this.lastQuaternion,
                  this.targetQuaternion,
                  i
                ),
                this.isBehindEarth)
              ) {
                this._startPos.copy(this.lastPosition),
                  this._endPos.copy(this.targetPosition),
                  this._startDir.copy(this._startPos).normalize(),
                  this._endDir.copy(this._endPos).normalize();
                let e = Math.acos(
                  Math.max(-1, Math.min(1, this._startDir.dot(this._endDir)))
                );
                e < 1e-6
                  ? this._rotationQuaternion.identity()
                  : (1e-6 > Math.abs(e - Math.PI)
                      ? (this._axis.set(1, 0, 0).cross(this._startDir),
                        1e-6 > this._axis.lengthSq() &&
                          this._axis.set(0, 1, 0).cross(this._startDir),
                        this._axis.normalize())
                      : this._axis
                          .crossVectors(this._startDir, this._endDir)
                          .normalize(),
                    this._rotationQuaternion.setFromAxisAngle(
                      this._axis,
                      e * i
                    )),
                  this._currentDir
                    .copy(this._startDir)
                    .applyQuaternion(this._rotationQuaternion);
                let t = this.targetPosition.length() + this.maxLerpDistance,
                  s = this.initialDistanceFromEarthCenter * (1 - i) + t * i;
                this._currentPosition.copy(this._currentDir).multiplyScalar(s),
                  this.object.position.copy(this._currentPosition);
              }
            } else this.target.copy(this.targetPosition), this.update();
          }
        }
        resize() {
          this.handleResize();
        }
        onSelectedSatelliteChanged(e, t) {
          var i;
          (this.enabled = !1),
            (this.isLerping = !0),
            (this.elapsedLerpTime = 0),
            this.lastQuaternion.copy(this.object.quaternion),
            this.lastPosition.copy(this.object.position),
            (this.isBehindEarth = t),
            (this.satData =
              null !== (i = null == e ? void 0 : e.detail) && void 0 !== i
                ? i
                : this.satData),
            (this.initialDistanceFromEarthCenter = this.lastPosition.length()),
            (this.startDistanceToTarget = this.lastPosition.distanceTo(
              this.targetPosition
            )),
            (this.lerpDurationMs = t ? 2e3 : 500);
        }
        constructor(e, t) {
          super(e, t),
            (this.lerpDurationMs = 500),
            (this.elapsedLerpTime = 0),
            (this.isLerping = !1),
            (this.isBehindEarth = !1),
            (this.maxLerpDistance = 60),
            (this.startDistanceToTarget = 0),
            (this.rotationMatrix = new h.yGw()),
            (this.lastQuaternion = new h._fP()),
            (this.lastPosition = new h.Pa4()),
            (this.defaultTargetPosition = new h.Pa4()),
            (this.targetPosition = new h.Pa4()),
            (this.targetQuaternion = new h._fP()),
            (this.initialDistanceFromEarthCenter = 0),
            (this.satData = null),
            (this._startPos = new h.Pa4()),
            (this._endPos = new h.Pa4()),
            (this._startDir = new h.Pa4()),
            (this._endDir = new h.Pa4()),
            (this._axis = new h.Pa4()),
            (this._rotationQuaternion = new h._fP()),
            (this._currentDir = new h.Pa4()),
            (this._currentPosition = new h.Pa4()),
            (this.noPan = !0),
            (this.minDistance = 20),
            (this.maxDistance = 1e4);
        }
      }
      let T = { SATELLITE: "satellite", EARTH: "earth" };
      class E extends CustomEvent {
        constructor(e, t) {
          super(e, t ? { detail: t } : {});
        }
      }
      let D = "highlightedSatelliteChanged",
        z = "selectedSatelliteChanged",
        F = "searchSatelliteSelected",
        A = "cameraFocusChanged",
        O = "engineLoaded";
      class U {
        getDistance() {
          return this.activeControls.object.position.distanceTo(
            new h.Pa4(0, 0, 0)
          );
        }
        update(e, t) {
          this.activeControls.customUpdate(e, t);
        }
        resize() {
          this.satelliteControls.resize(), this.earthControls.resize();
        }
        registerEventListeners() {
          window.addEventListener(A, this.onFocusEarthToggle.bind(this)),
            window.addEventListener(
              z,
              this.onSelectedSatelliteChanged.bind(this)
            );
        }
        switchControls(e) {
          if (this.activeControlsType !== e) {
            switch (((this.activeControlsType = e), e)) {
              case T.EARTH:
                if (this.activeControls === this.earthControls) return;
                this.activeControls = this.earthControls;
                break;
              case T.SATELLITE:
                if (this.activeControls === this.satelliteControls) return;
                (this.activeControls = this.satelliteControls),
                  this.satelliteControls.onSelectedSatelliteChanged(void 0, !0);
            }
            this.earthControls.setActive(e === T.EARTH),
              this.satelliteControls.setActive(e === T.SATELLITE),
              this.activeControls.object.up.set(0, 1, 0);
          }
        }
        onFocusEarthToggle(e) {
          let t = e.detail;
          this.switchControls(t);
        }
        onSelectedSatelliteChanged(e) {
          var t;
          let i = (function (e, t) {
              let i = (function (e, t) {
                if (!e) return null;
                let i = (0, a.a0)(e, t);
                return d(i.position)
                  ? new h.Pa4(i.position.x, i.position.y, i.position.z)
                  : null;
              })(e, t);
              return i
                ? i.multiplyScalar(0.02).applyAxisAngle(new h.Pa4(1, 0, 0), c)
                : null;
            })(
              null === (t = e.detail) || void 0 === t ? void 0 : t.satRec,
              new Date()
            ),
            s = !1,
            n = !1;
          if (i) {
            n =
              (null == i ? void 0 : i.distanceTo(new h.Pa4(0, 0, 0))) < 127.42;
            let e = i
              .clone()
              .sub(this.activeControls.object.position)
              .normalize();
            this.ray.set(this.activeControls.object.position, e),
              (this.ray.far =
                this.activeControls.object.position.distanceTo(i)),
              (s = this.ray.intersectObject(this.earth).length > 0);
          }
          this.satelliteControls.onSelectedSatelliteChanged(
            e,
            s || n || this.isFirstSatellite
          ),
            this.earthControls.onSelectedSatelliteChanged(
              e,
              s || n || this.isFirstSatellite
            ),
            (this.isFirstSatellite = !1);
        }
        constructor(e, t, i) {
          (this.ray = new h.iMs()),
            (this.isFirstSatellite = !0),
            (this.earthControls = new I(e, t)),
            (this.satelliteControls = new R(e, t)),
            (this.earth = i),
            this.switchControls(T.SATELLITE),
            this.registerEventListeners();
        }
      }
      class N extends h.iMs {
        raycast(e, t, i) {
          this.setFromCamera(e, t);
          let s = this.intersectObjects(i)[0];
          return null != s ? s : null;
        }
        constructor() {
          super();
        }
      }
      class H extends h.cPb {
        resize(e) {
          let { clientWidth: t, clientHeight: i } = e;
          (this.aspect = t / i), this.updateProjectionMatrix();
        }
        constructor() {
          super(50, 1, 1, 2e5),
            this.position.set(700, 0, 0),
            (this.up = new h.Pa4(0, 1, 0));
        }
      }
      class B extends h.ZAu {
        onTextureLoaded(e) {
          (e.colorSpace = h.KI_),
            (this._material.map = e),
            (this._material.color = new h.Ilk("white")),
            (this._material.needsUpdate = !0);
        }
        constructor() {
          super(),
            (this._geometry = new h.xo$(127.42, 64, 32)),
            (this._material = new h.YBo({ color: 24473 })),
            new h.dpR().load(
              "https://satellitetracker3d.nyc3.cdn.digitaloceanspaces.com/earth-realistic-8k.webp",
              (e) => this.onTextureLoaded(e),
              void 0,
              (e) => console.log(e)
            ),
            (this._mesh = new h.Kj0(this._geometry, this._material)),
            (this._mesh.name = "earthMesh"),
            this.add(this._mesh),
            (this.name = "earth");
          let e = () => {
            let t = new Date(),
              i = (0, a.Ut)(t);
            (this.rotation.y = i), window.requestAnimationFrame(e);
          };
          window.requestAnimationFrame(e);
        }
      }
      class W extends h.ZAu {
        constructor() {
          super();
          let e = new h.Mig("white", 3);
          (e.name = "ambientLight"), this.add(e);
        }
      }
      class Y extends h.ZAu {
        constructor() {
          super();
          let e = new h.dpR(),
            t = e.load("/_next/static/media/meme-looking-forward.553035f8.jpg"),
            i = e.load("/_next/static/media/meme-looking-back.63055345.jpg"),
            s = new h.YBo({ map: t }),
            n = new h.YBo({ map: i }),
            r = new h.DvJ(1, 1, 1, 1, 1, 1),
            a = new h.Kj0(r, [s, s, s, n, n, n]);
          (this.name = "memeBox"), this.add(a);
        }
      }
      class X extends CustomEvent {
        constructor(e, t) {
          super(e, t ? { detail: t } : {});
        }
      }
      class q {
        setSatRecs(e) {
          (this._satRecs = e),
            (this._workerCount = Math.max(
              2,
              Math.round(this._satRecs.length / this._mybenchmarkedSweetSpot)
            )),
            (this._workerSatRecs = (function (e, t) {
              let i = [...e],
                s = [];
              for (let e = t; e > 0; e--)
                s.push(i.splice(0, Math.ceil(i.length / e)));
              return s;
            })(this._satRecs, this._workerCount));
          for (let e = 0; e < this._workerCount; e++) {
            this._workers[e] = new Worker(i.tu(new URL(i.p + i.u(22), i.b)), {
              type: void 0,
            });
            let t = { type: "initialize", payload: this._workerSatRecs[e] };
            this._workers[e].postMessage(t),
              (this._workers[e].onmessage = (t) =>
                this.onWorkerMessageReceived(t, e));
          }
        }
        propagate(e) {
          this._result = new Float32Array(3 * this._satRecs.length);
          for (let t = 0; t < this._workerCount; t++) {
            let i = { type: "propagate", payload: e };
            this._workers[t].postMessage(i);
          }
        }
        setObserverLocation(e) {
          for (let t = 0; t < this._workerCount; t++) {
            let i = { type: "setGeoLocation", payload: e };
            this._workers[t].postMessage(i);
          }
        }
        onWorkerMessageReceived(e, t) {
          this._workersFinished++;
          let i = 0;
          for (let e = 0; e < t; e++) i += this._workerSatRecs[e].length;
          this._result.set(e.data, 3 * i),
            this._workersFinished === this._workerCount &&
              ((this._workersFinished = 0),
              this._satellites.setBuffer(this._result));
        }
        constructor(e) {
          (this._workers = []),
            (this._workerSatRecs = []),
            (this._workersFinished = 0),
            (this._mybenchmarkedSweetSpot = 15e3),
            (this._satellites = e);
        }
      }
      class Q extends h.ZAu {
        get points() {
          return this._points;
        }
        get highlightedInstanceIndex() {
          return this._highlightedInstanceIndex;
        }
        get selectedInstanceIndex() {
          return this._selectedInstanceIndex;
        }
        onTextureLoaded(e) {
          (this._material = new h.UY4({
            size: 2,
            sizeAttenuation: !0,
            map: e,
            alphaTest: 0.5,
            transparent: !0,
            vertexColors: !0,
          })),
            (this._points = new h.woe(this._geometry, this._material)),
            this.add(this._points);
        }
        setPointSize(e) {
          this._material && (this._material.size = e / 500 + 1.5);
        }
        initialize() {
          let e = this._satDataSet.satRecs;
          (this._geometryPositionAttribute = new h.a$l(3 * e.length, 3)),
            this._geometry.setAttribute(
              "position",
              this._geometryPositionAttribute
            ),
            this.recolor(),
            (this._workerHandler = new q(this)),
            this._workerHandler.setSatRecs(e),
            this.workerPropgate();
        }
        setBuffer(e) {
          (this._buffer = e), this.updateGeometry(), (this._canRender = !0);
        }
        updateGeometry() {
          this._geometryPositionAttribute.array.set(this._buffer),
            (this._geometryPositionAttribute.needsUpdate = !0),
            (this._didWorkersFinish = !0),
            this._isFirstRender &&
              (this._geometry.computeBoundingSphere(),
              (this._isFirstRender = !1),
              window.requestAnimationFrame(() => {
                let e = new CustomEvent(O);
                window.dispatchEvent(e);
              }));
        }
        workerPropgate() {
          (this._lastCalculatedDate = new Date()),
            this._workerHandler.propagate(this._lastCalculatedDate);
        }
        setObserverLocation(e) {
          this._workerHandler.setObserverLocation(e);
        }
        render() {
          this._canRender &&
            this._didWorkersFinish &&
            (this.workerPropgate(), (this._didWorkersFinish = !1));
        }
        recolor() {
          let e = this._geometryPositionAttribute.array.length,
            t = new Float32Array(e);
          for (let i = 0; i < e / 3; i++)
            (t[3 * i] = this._defaultColor.r),
              (t[3 * i + 1] = this._defaultColor.g),
              (t[3 * i + 2] = this._defaultColor.b);
          this._geometry.setAttribute("color", new h.a$l(t, 3));
        }
        getSatellitePosition(e) {
          if (e < 0 || e >= this._satDataSet.satRecs.length) return null;
          let t = this._buffer.subarray(3 * e, (e + 1) * 3);
          return new h.Pa4(...t);
        }
        toWorldPosition(e) {
          return null === e ? null : this.localToWorld(e);
        }
        selectSatellite(e) {
          if (!this._canRender) return;
          let t = this._geometry.attributes.color;
          this.clearHighlightedSatellite(t, t.array),
            this.handleMouseClick(e, t, t.array);
        }
        handleMouseInput(e, t) {
          if (!this._canRender) return;
          let i = this._geometry.attributes.color;
          if (null == e || e.object !== this._points) {
            t || this.clearHighlightedSatellite(i, i.array);
            return;
          }
          let s = e.object === this._points ? e.index : null;
          (null == s && t) ||
            (t
              ? this.handleMouseClick(s, i, i.array)
              : this.handleMouseover(s, i, i.array));
        }
        clearHighlightedSatellite(e, t) {
          -1 !== this._highlightedInstanceIndex &&
            (this.updateSatelliteColor(
              t,
              this._highlightedInstanceIndex,
              this._defaultColor
            ),
            this.flagOnlyOneUpdatedColorForUpdate(
              e,
              this._highlightedInstanceIndex
            ),
            (this._highlightedInstanceIndex = -1),
            window.dispatchEvent(
              new X(D, {
                index: this._highlightedInstanceIndex,
                satRec:
                  this._satDataSet.satRecs[this._highlightedInstanceIndex],
                tle: this._satDataSet.tles[this._highlightedInstanceIndex],
              })
            ));
        }
        handleMouseClick(e, t, i) {
          null != e &&
            e !== this._selectedInstanceIndex &&
            (this.updateSatelliteColor(i, e, this._selectedColor),
            -1 === this._selectedInstanceIndex
              ? this.flagOnlyOneUpdatedColorForUpdate(t, e)
              : (this.updateSatelliteColor(
                  i,
                  this._selectedInstanceIndex,
                  this._defaultColor
                ),
                this.flagRangeBetweenUpdatedColorsForUpdate(
                  t,
                  this._selectedInstanceIndex,
                  e
                )),
            e === this._highlightedInstanceIndex &&
              ((this._highlightedInstanceIndex = -1),
              window.dispatchEvent(new X(D))),
            (this._selectedInstanceIndex = e),
            window.dispatchEvent(
              new X(z, {
                index: this._selectedInstanceIndex,
                satRec: this._satDataSet.satRecs[this._selectedInstanceIndex],
                tle: this._satDataSet.tles[this._selectedInstanceIndex],
              })
            ));
        }
        handleMouseover(e, t, i) {
          null != e &&
            e !== this._highlightedInstanceIndex &&
            e !== this._selectedInstanceIndex &&
            e !== this._highlightedInstanceIndex &&
            (this.updateSatelliteColor(i, e, this._highlightedColor),
            -1 === this._highlightedInstanceIndex
              ? this.flagOnlyOneUpdatedColorForUpdate(t, e)
              : (this.updateSatelliteColor(
                  i,
                  this._highlightedInstanceIndex,
                  this._defaultColor
                ),
                this.flagRangeBetweenUpdatedColorsForUpdate(
                  t,
                  this._highlightedInstanceIndex,
                  e
                )),
            (this._highlightedInstanceIndex = e),
            window.dispatchEvent(
              new X(D, {
                index: this._highlightedInstanceIndex,
                satRec:
                  this._satDataSet.satRecs[this._highlightedInstanceIndex],
                tle: this._satDataSet.tles[this._highlightedInstanceIndex],
              })
            ));
        }
        updateSatelliteColor(e, t, i) {
          (e[3 * t] = i.r), (e[3 * t + 1] = i.g), (e[3 * t + 2] = i.b);
        }
        flagOnlyOneUpdatedColorForUpdate(e, t) {
          e.addUpdateRange(3 * t, 3), (e.needsUpdate = !0);
        }
        flagRangeBetweenUpdatedColorsForUpdate(e, t, i) {
          let s = 3 * Math.min(t, i),
            n = 3 * Math.max(t, i);
          e.addUpdateRange(s, n - s + 3), (e.needsUpdate = !0);
        }
        constructor(e) {
          super(),
            (this._material = null),
            (this._canRender = !1),
            (this._isFirstRender = !0),
            (this._defaultColor = new h.Ilk(16777215)),
            (this._highlightedColor = new h.Ilk(8322174)),
            (this._selectedColor = new h.Ilk(65280)),
            (this._highlightedInstanceIndex = -1),
            (this._selectedInstanceIndex = -1),
            (this._didWorkersFinish = !1),
            (this._satDataSet = e),
            (this._geometry = new h.u9r()),
            new h.dpR().load(
              "/_next/static/media/dot-medium.13d7e8cb.png",
              (e) => this.onTextureLoaded(e),
              void 0,
              (e) => console.log(e)
            ),
            this.rotateX(c),
            window.addEventListener(F, (e) => {
              let t = e.detail;
              t && this.selectSatellite(t.index);
            }),
            window.addEventListener("satelliteFilterChanged", (e) => {
              let t = e.detail;
              this.setObserverLocation(null == t ? void 0 : t.geoLocation);
            }),
            this.initialize();
        }
      }
      var K = i(4175),
        G = i(9823),
        V = i(1911);
      class $ extends h.ZAu {
        drawOrbit(e) {
          let t;
          if (!e) return;
          let i = e.satRec,
            s = (i.no / (2 * Math.PI)) * 1440,
            n = new Date();
          n.setTime(n.getTime() - this._milisecondsInADay / (2 * s));
          let r = new Date();
          for (let e = 0; e < this._pointCount; e++)
            r.setTime(
              n.getTime() + (this._milisecondsInADay / s / this._pointCount) * e
            ),
              d((t = a.a0(i, r)).position) &&
                ((this._linePoints[3 * e] = t.position.x),
                (this._linePoints[3 * e + 1] = t.position.y),
                (this._linePoints[3 * e + 2] = t.position.z));
          this._geometry.setPositions(this._linePoints),
            this._geometry.computeBoundingSphere(),
            this._line.computeLineDistances();
        }
        constructor() {
          super(),
            (this._pointCount = 500),
            (this._linePoints = new Float32Array(3 * this._pointCount)),
            (this._milisecondsInADay = 864e5);
          let e = new V.Y({ color: 65280, linewidth: 2 });
          (this._geometry = new G.L()),
            (this._line = new K.w(this._geometry, e)),
            this.add(this._line);
          for (let e = 0; e < this._pointCount; e++)
            (this._linePoints[3 * e] = 0),
              (this._linePoints[3 * e + 1] = 0),
              (this._linePoints[3 * e + 2] = 0);
          (this._line.name = "satelliteOrbit"),
            this._line.scale.set(0.02, 0.02, 0.02),
            this.rotateX(c),
            window.addEventListener(z, (e) => {
              let t = e.detail;
              this.drawOrbit(t);
            });
        }
      }
      class J extends h.ZAu {
        updateSatellitePosition(e) {
          var t, i, s;
          (this._linePoints[3] =
            null !== (t = null == e ? void 0 : e.x) && void 0 !== t ? t : 0),
            (this._linePoints[4] =
              null !== (i = null == e ? void 0 : e.y) && void 0 !== i ? i : 0),
            (this._linePoints[5] =
              null !== (s = null == e ? void 0 : e.z) && void 0 !== s ? s : 0),
            this._geometry.setPositions(this._linePoints),
            this._geometry.computeBoundingSphere();
        }
        constructor() {
          super(),
            (this._pointCount = 2),
            (this._linePoints = new Float32Array(3 * this._pointCount)),
            (this._geometry = new G.L());
          for (let e = 0; e < this._pointCount; e++)
            (this._linePoints[3 * e] = 0),
              (this._linePoints[3 * e + 1] = 0),
              (this._linePoints[3 * e + 2] = 0);
          let e = new V.Y({ color: 65280, linewidth: 1 }),
            t = new K.w(this._geometry, e);
          this.add(t), (this.name = "satelliteToEarthLine");
        }
      }
      class ee extends h.xsS {
        getEarth() {
          return this.earth;
        }
        getMemeBox() {
          return this.memeBox;
        }
        getSatelliteLine() {
          return this.satelliteLine;
        }
        getCamera() {
          return this.camera;
        }
        getControls() {
          return this.controls;
        }
        getRaycaster() {
          return this.raycaster;
        }
        getSatellites() {
          return this.satellites;
        }
        getSatelliteOrbit() {
          return this.satelliteOrbit;
        }
        constructor(e, t) {
          super(),
            (this.name = "mainScene"),
            (this.lights = new W()),
            (this.earth = new B()),
            (this.memeBox = new Y()),
            (this.satelliteLine = new J()),
            (this.camera = new H()),
            (this.controls = new U(this.camera, e.domElement, this.earth)),
            (this.raycaster = new N()),
            (this.satellites = new Q(t)),
            (this.satelliteOrbit = new $()),
            this.add(
              this.lights,
              this.earth,
              this.camera,
              this.memeBox,
              this.satelliteLine,
              this.camera,
              this.satellites,
              this.satelliteOrbit
            );
        }
      }
      class et extends h.CP7 {
        resize(e) {
          let { clientWidth: t, clientHeight: i } = e;
          this.setSize(t, i);
        }
        constructor() {
          super({ antialias: !1 }),
            this.setPixelRatio(Math.min(window.devicePixelRatio, 2)),
            this.setClearColor("black", 1),
            (this.domElement.id = "canvas"),
            (this.domElement.style.position = "absolute"),
            (this.domElement.style.top = "0"),
            (this.domElement.style.left = "0"),
            (this.domElement.style.width = "100%"),
            (this.domElement.style.height = "100%");
        }
      }
      var ei = (e, t) => {
          (0, r.useEffect)(() => {
            let i = new et();
            e.appendChild(i.domElement);
            let s = new ee(i, t),
              n = new P(e);
            return (
              new ResizeObserver(() => {
                i.resize(e), s.getCamera().resize(e), s.getControls().resize();
              }).observe(e),
              !(function (e, t, i) {
                let s = t.getCamera(),
                  n = t.getEarth(),
                  r = t.getMemeBox(),
                  a = t.getSatelliteLine(),
                  l = t.getControls(),
                  o = t.getRaycaster(),
                  h = t.getSatellites(),
                  c = 0;
                window.requestAnimationFrame(function d(u) {
                  h.render(),
                    (function () {
                      if (
                        !i.isOverCanvas ||
                        (!i.isUsingMouse && !i.isMouseUpThisFrame)
                      )
                        return;
                      let e = h.points
                        ? o.raycast(i.mousePosition, s, [h.points, r, n])
                        : null;
                      h.handleMouseInput(e, i.isMouseUpThisFrame);
                    })();
                  let C = h.getSatellitePosition(h.selectedInstanceIndex),
                    p = h.toWorldPosition(C);
                  a.updateSatellitePosition(p),
                    l.update(u - c, C),
                    i.frameEnded(),
                    h.setPointSize(l.getDistance()),
                    (c = u),
                    e.render(t, s),
                    window.requestAnimationFrame(d);
                });
              })(i, s, n),
              () => {
                i.dispose(), e.removeChild(i.domElement);
              }
            );
          }, [e, t]);
        },
        es = i(4529),
        en = i(9445),
        er = i(8155),
        ea = i(6212),
        el = i(9645),
        eo = i(4039),
        eh = i(2170),
        ec = i(8788),
        ed = i(5401),
        eu = i(9514),
        eC = i(8887),
        ep = () => {
          let { panel: e, setPanel: t } = eq(),
            i = (e) => {
              switch (e) {
                case 0:
                default:
                  return eY.SATELLITE;
                case 1:
                  return eY.CHART;
                case 2:
                  return eY.INFO;
                case 3:
                  return eY.SUPPORT;
              }
            };
          return (0, n.jsx)(eh.Z, {
            sx: { display: "flex", height: "100%", width: "100%" },
            children: (0, n.jsxs)(ec.Z, {
              value: ((e) => {
                switch (e) {
                  case eY.SATELLITE:
                    return 0;
                  case eY.CHART:
                    return 1;
                  case eY.INFO:
                    return 2;
                  case eY.SUPPORT:
                    return 3;
                  default:
                    return 0;
                }
              })(e),
              onChange: (e, s) => {
                t(i(s));
              },
              children: [
                (0, n.jsx)(ed.Z, {
                  title: "Satellite details",
                  disableTouchListener: !0,
                  children: (0, n.jsx)(eu.Z, { icon: (0, n.jsx)(er.Z, {}) }),
                }),
                (0, n.jsx)(ed.Z, {
                  title: "Satellite charts",
                  disableTouchListener: !0,
                  children: (0, n.jsx)(eu.Z, { icon: (0, n.jsx)(ea.Z, {}) }),
                }),
                (0, n.jsx)(ed.Z, {
                  title: "App info",
                  disableTouchListener: !0,
                  children: (0, n.jsx)(eu.Z, { icon: (0, n.jsx)(el.Z, {}) }),
                }),
                (0, n.jsx)(ed.Z, {
                  title: "Support",
                  disableTouchListener: !0,
                  children: (0, n.jsx)(eu.Z, {
                    icon: (0, n.jsx)(eo.Z, { sx: { color: eC.Z[500] } }),
                  }),
                }),
              ],
            }),
          });
        },
        ex = i(6788),
        eg = i(493),
        em = i(8649),
        ef = i(9412),
        ew = i(2703),
        ev = i(6912),
        ej = i(2731),
        ey = i(1828),
        e_ = i(7484),
        eb = i.n(e_),
        eZ = (e) => {
          let { isVisible: t } = e,
            { selectedSatData: i } = eq(),
            [s, l] = (0, r.useState)([]),
            [h, c] = (0, r.useState)([]),
            [C, x] = (0, r.useState)([]),
            [g, m] = (0, r.useState)([]),
            [f, y] = (0, r.useState)(1),
            { isTransitioning: _ } = eq(),
            b = (e, t) => {
              let s = null != e ? e : null == i ? void 0 : i.satRec;
              if (!s) return;
              let n = [],
                r = [],
                h = [],
                C = [];
              for (let e of (function (e, t) {
                let i = eb()(),
                  s = [],
                  n = ((2 * Math.PI) / t.no) * e,
                  r = 50 + 50 * e,
                  a = n / 2,
                  l = n / (r - 1);
                for (let e = 0; e < r; e++) {
                  let t = e * l - a,
                    n = i.add(t, "minute");
                  s.push(n);
                }
                return s;
              })(null != t ? t : f, s)) {
                let t = (0, a.a0)(s, e.toDate());
                if (!d(t.velocity) || !d(t.position)) continue;
                let i = u(t.velocity);
                n.push({ x: e, y: p(i) });
                let l = (0, a.Ut)(e.toDate()),
                  c = (0, a.jX)(t.position, l);
                r.push({ x: e, y: c.height }),
                  h.push({ x: e, y: (0, o.ZY)(c.longitude) }),
                  C.push({ x: e, y: (0, o.ZY)(c.latitude) });
              }
              c(r), l(n), x(C), m(h);
            };
          return (
            (0, r.useEffect)(() => {
              b(null == i ? void 0 : i.satRec);
            }, [i]),
            (0, n.jsxs)(eh.Z, {
              children: [
                (0, n.jsx)(ex.Z, {
                  sx: { margin: "0 0 16px 0", color: "text.secondary" },
                  children: "Choose the number of revolutions to display:",
                }),
                (0, n.jsxs)(eg.Z, {
                  sx: { width: "200px" },
                  children: [
                    (0, n.jsx)(em.Z, {
                      id: "select-revolutions-label",
                      children: "Revolutions",
                    }),
                    (0, n.jsxs)(ef.Z, {
                      size: "small",
                      labelId: "select-revolutions-label",
                      id: "select-revolutions",
                      value: f,
                      label: "Revolutions",
                      onChange: (e) => {
                        let t = e.target.value;
                        y(t), b(void 0, t);
                      },
                      children: [
                        (0, n.jsx)(
                          ew.Z,
                          { value: 1, children: "One revolution" },
                          1
                        ),
                        (0, n.jsx)(
                          ew.Z,
                          { value: 2, children: "Two revolutions" },
                          2
                        ),
                        (0, n.jsx)(
                          ew.Z,
                          { value: 3, children: "Three revolutions" },
                          3
                        ),
                      ],
                    }),
                  ],
                }),
                (0, n.jsx)(ev.Z, { sx: { margin: "32px 0" } }),
                (0, n.jsx)(ex.Z, { children: "Speed (km/h):" }),
                (0, n.jsx)(eh.Z, {
                  sx: { width: "100%", minHeight: "220px" },
                  children:
                    t &&
                    !_ &&
                    (0, n.jsx)(ej.w, {
                      dataset: s,
                      xAxis: [
                        {
                          dataKey: "x",
                          valueFormatter: (e) => eb()(e).format("MMM/DD HH:mm"),
                        },
                      ],
                      series: [
                        {
                          dataKey: "y",
                          showMark: !1,
                          valueFormatter: (e) => j(null != e ? e : 0),
                        },
                      ],
                      height: 220,
                      margin: { left: 60, right: 40, top: 10, bottom: 20 },
                      grid: { vertical: !0, horizontal: !0 },
                      sx: {
                        ["& .".concat(ey.x.left, " .").concat(ey.x.label)]: {
                          transform: "translateX(-24px)",
                        },
                      },
                      slotProps: {
                        noDataOverlay: {
                          message: "Click or select a satellite to view chart.",
                        },
                      },
                    }),
                }),
                (0, n.jsx)(ev.Z, { sx: { margin: "32px 0" } }),
                (0, n.jsx)(ex.Z, { children: "Height (km):" }),
                (0, n.jsx)(eh.Z, {
                  sx: { width: "100%", minHeight: "220px" },
                  children:
                    t &&
                    !_ &&
                    (0, n.jsx)(ej.w, {
                      dataset: h,
                      xAxis: [
                        {
                          dataKey: "x",
                          label: "Date",
                          valueFormatter: (e) => eb()(e).format("MMM/DD HH:mm"),
                        },
                      ],
                      series: [
                        {
                          dataKey: "y",
                          showMark: !1,
                          valueFormatter: (e) => v(null != e ? e : 0),
                        },
                      ],
                      height: 220,
                      margin: { left: 60, right: 40, top: 10, bottom: 20 },
                      grid: { vertical: !0, horizontal: !0 },
                      sx: {
                        ["& .".concat(ey.x.left, " .").concat(ey.x.label)]: {
                          transform: "translateX(-24px)",
                        },
                      },
                      slotProps: {
                        noDataOverlay: {
                          message: "Click or select a satellite to view chart.",
                        },
                      },
                    }),
                }),
                (0, n.jsx)(ev.Z, { sx: { margin: "32px 0" } }),
                (0, n.jsx)(ex.Z, { children: "Latitude (\xb0):" }),
                (0, n.jsx)(eh.Z, {
                  sx: { width: "100%", minHeight: "220px" },
                  children:
                    t &&
                    !_ &&
                    (0, n.jsx)(ej.w, {
                      dataset: C,
                      xAxis: [
                        {
                          dataKey: "x",
                          label: "Date",
                          valueFormatter: (e) => eb()(e).format("MMM/DD HH:mm"),
                        },
                      ],
                      series: [
                        {
                          dataKey: "y",
                          showMark: !1,
                          valueFormatter: (e) => w(null != e ? e : 0),
                        },
                      ],
                      height: 220,
                      margin: { left: 60, right: 40, top: 10, bottom: 20 },
                      grid: { vertical: !0, horizontal: !0 },
                      sx: {
                        ["& .".concat(ey.x.left, " .").concat(ey.x.label)]: {
                          transform: "translateX(-24px)",
                        },
                      },
                      slotProps: {
                        noDataOverlay: {
                          message: "Click or select a satellite to view chart.",
                        },
                      },
                    }),
                }),
                (0, n.jsx)(ev.Z, { sx: { margin: "32px 0" } }),
                (0, n.jsx)(ex.Z, { children: "Longitude (\xb0):" }),
                (0, n.jsx)(eh.Z, {
                  sx: { width: "100%", minHeight: "220px" },
                  children:
                    t &&
                    !_ &&
                    (0, n.jsx)(ej.w, {
                      dataset: g,
                      xAxis: [
                        {
                          dataKey: "x",
                          label: "Date",
                          valueFormatter: (e) => eb()(e).format("MMM/DD HH:mm"),
                        },
                      ],
                      series: [
                        {
                          dataKey: "y",
                          showMark: !1,
                          valueFormatter: (e) => w(null != e ? e : 0),
                        },
                      ],
                      height: 220,
                      margin: { left: 60, right: 40, top: 10, bottom: 20 },
                      grid: { vertical: !0, horizontal: !0 },
                      sx: {
                        ["& .".concat(ey.x.left, " .").concat(ey.x.label)]: {
                          transform: "translateX(-24px)",
                        },
                      },
                      slotProps: {
                        noDataOverlay: {
                          message: "Click or select a satellite to view chart.",
                        },
                      },
                    }),
                }),
              ],
            })
          );
        },
        eM = i(6515),
        eS = i(6694),
        eP = i(1769),
        eL = i(2857),
        eI = i(1589),
        ek = (e) =>
          (0, n.jsx)(eI.Z, {
            ...e,
            viewBox: "0 0 24 24",
            children: (0, n.jsx)("path", {
              d: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z",
            }),
          }),
        eR = () =>
          (0, n.jsxs)(eh.Z, {
            children: [
              (0, n.jsxs)(ex.Z, {
                variant: "h5",
                children: [
                  "Welcome to",
                  " ",
                  (0, n.jsx)(eh.Z, {
                    component: "span",
                    sx: { color: "primary.main" },
                    children: "Satellite\xa0Tracker\xa03D",
                  }),
                  "!",
                ],
              }),
              (0, n.jsx)(ex.Z, {
                variant: "h6",
                sx: { margin: "20px 0 10px 0" },
                children:
                  "Experience Real-Time 3D Satellite Tracking Like Never Before",
              }),
              (0, n.jsx)(ex.Z, {
                children:
                  "Satellite Tracker 3D is a premier platform for real-time, 3D tracking of over 24,000 satellites directly in your browser. By leveraging up-to-date Two-Line Element (TLE) data and the precise SPG4 orbit prediction model, it offers an accurate and immersive way to explore satellite positions and movements around Earth.",
              }),
              (0, n.jsx)(ex.Z, {
                variant: "h6",
                sx: { margin: "20px 0 10px 0" },
                children: "New Feature: AI assisted content",
              }),
              (0, n.jsx)(ex.Z, {
                children:
                  "The newest update blends satellite tracking with AI, adding an additional layer of immersion to SatelliteTracker3D.com. In a sea of unorganized satellite data, SatelliteTracker3D now leverages its own repository of over 6,000 AI-summarized descriptions and over 2,000 AI-gathered images, covering more than 25,000 satellites. This gives it the unique ability to provide you with the backstory of a piece of debris you just found—possibly the result of a long-forgotten weapons test. While tracking it in real time. In 3D. Right in your pocket.",
              }),
              (0, n.jsx)(ex.Z, {
                variant: "h6",
                sx: { margin: "20px 0 10px 0" },
                children:
                  "New Feature: Time-Based Graphs for Satellite Speed and Geolocation",
              }),
              (0, n.jsx)(ex.Z, {
                children:
                  "Introducing the latest enhancement: time-based graphs for satellite speed and geolocation over any user-defined period. This powerful feature allows users to analyze and visualize satellite trajectories and velocities over time, providing deeper insights into orbital mechanics and satellite behavior.",
              }),
              (0, n.jsx)(ex.Z, {
                variant: "h6",
                sx: { margin: "20px 0 10px 0" },
                children: "Key Features",
              }),
              (0, n.jsxs)(ex.Z, {
                sx: { margin: "0 0 10px 0" },
                children: [
                  (0, n.jsx)("strong", { children: "Real-Time 3D Tracking:" }),
                  " Observe satellites in real-time with interactive 3D view that bring space closer to you.",
                ],
              }),
              (0, n.jsxs)(ex.Z, {
                sx: { margin: "0 0 10px 0" },
                children: [
                  (0, n.jsx)("strong", { children: "Interactive Controls:" }),
                  " Navigate, zoom, and select satellites using intuitive mouse or touch interactions.",
                ],
              }),
              (0, n.jsxs)(ex.Z, {
                sx: { margin: "0 0 10px 0" },
                children: [
                  (0, n.jsx)("strong", {
                    children: "Detailed Satellite Information:",
                  }),
                  " Access comprehensive data including geographic coordinates, speed, and orbital paths.",
                ],
              }),
              (0, n.jsxs)(ex.Z, {
                sx: { margin: "0 0 10px 0" },
                children: [
                  (0, n.jsx)("strong", { children: "Orbit Visualization:" }),
                  " View visually stunning orbits relative to Earth for a unique perspective on space technology.",
                ],
              }),
              (0, n.jsxs)(ex.Z, {
                sx: { margin: "0 0 10px 0" },
                children: [
                  (0, n.jsx)("strong", { children: "Toggle Views:" }),
                  " Seamlessly switch between Earth-centric and satellite-centric views for customized exploration.",
                ],
              }),
              (0, n.jsxs)(ex.Z, {
                sx: { margin: "0 0 10px 0" },
                children: [
                  (0, n.jsx)("strong", {
                    children: "Time-Based Data Analysis:",
                  }),
                  " Generate graphs of satellite speed and geolocation over any time frame you choose.",
                ],
              }),
              (0, n.jsx)(ex.Z, {
                variant: "h6",
                sx: { margin: "20px 0 10px 0" },
                children: "Designed for Simplicity and Performance",
              }),
              (0, n.jsx)(ex.Z, {
                children:
                  "Satellite Tracker 3D is crafted with simplicity and performance in mind, delivering a seamless tracking experience with high frame rates across a variety of devices. Whether you're a space enthusiast, educator, or professional, this platform provides valuable insights into satellite operations and orbital dynamics.",
              }),
              (0, n.jsx)(ex.Z, {
                variant: "h6",
                sx: { margin: "20px 0 10px 0" },
                children: "Join the Community",
              }),
              (0, n.jsxs)(ex.Z, {
                sx: { margin: "0 0 10px 0" },
                children: [
                  "Connect with other satellite tracking enthusiasts on the",
                  " ",
                  (0, n.jsx)(eP.Z, {
                    href: "https://discord.gg/R8RfQN9BNv",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    children: "Discord channel",
                  }),
                  ". It's the perfect place to get updates, ask questions, share observations, and contribute ideas. Your feedback is invaluable in helping to improve and add new features.",
                ],
              }),
              (0, n.jsxs)(ex.Z, {
                sx: { margin: "0 0 10px 0" },
                children: [
                  "Feel free to connect with me on",
                  " ",
                  (0, n.jsx)(eP.Z, {
                    href: "https://www.linkedin.com/in/marko-andlar-645524212",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    children: "LinkedIn",
                  }),
                  ".",
                ],
              }),
              (0, n.jsxs)(en.Z, {
                container: !0,
                direction: "row",
                spacing: 1,
                children: [
                  (0, n.jsx)(en.Z, {
                    children: (0, n.jsx)(eL.Z, {
                      href: "https://www.linkedin.com/in/marko-andlar-645524212",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      children: (0, n.jsx)(eM.Z, {}),
                    }),
                  }),
                  (0, n.jsx)(en.Z, {
                    children: (0, n.jsx)(eL.Z, {
                      href: "https://discord.gg/R8RfQN9BNv",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      children: (0, n.jsx)(ek, {}),
                    }),
                  }),
                  (0, n.jsx)(en.Z, {
                    children: (0, n.jsx)(eL.Z, {
                      href: "https://x.com/sattrack3d",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      children: (0, n.jsx)(eS.Z, {}),
                    }),
                  }),
                ],
              }),
              (0, n.jsx)(ev.Z, { sx: { margin: "20px 0" } }),
              (0, n.jsxs)(ex.Z, {
                variant: "body2",
                sx: { margin: "20px 0 0 0" },
                children: [
                  "\xa9 2024 Marko Andlar",
                  (0, n.jsx)("br", {}),
                  "Version 0.4.5",
                ],
              }),
              (0, n.jsx)(ev.Z, { sx: { margin: "20px 0" } }),
              (0, n.jsx)(ex.Z, {
                variant: "caption",
                sx: { margin: "20px 0 0 0", fontStyle: "italic" },
                children:
                  "Satellite Tracker 3D — the satellite index in your pocket.",
              }),
            ],
          }),
        eT = i(762),
        eE = i(1919),
        eD = (e) => {
          let { children: t, isVisible: i } = e;
          return (0, n.jsx)(eT.Z, {
            variant: "outlined",
            sx: {
              height: "100%",
              width: "100%",
              display: i ? "block" : "none",
            },
            children: (0, n.jsx)(eE.Z, { children: t }),
          });
        },
        ez = i(7633),
        eF = i(7182),
        eA = (e) => {
          let { isLoading: t } = e;
          return (0, n.jsx)(eh.Z, {
            sx: {
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            },
            children: t && (0, n.jsx)(eF.Z, {}),
          });
        };
      let eO = { description: null, imageTitle: null, imageSource: null },
        eU = [
          "satellites/generic-satellite-01.webp",
          "satellites/generic-satellite-02.webp",
          "satellites/generic-satellite-03.webp",
          "satellites/generic-satellite-04.webp",
          "satellites/generic-satellite-05.webp",
          "satellites/generic-satellite-06.webp",
          "satellites/generic-satellite-07.webp",
        ],
        eN = () => {
          var e;
          return null !== (e = eU[Math.floor(Math.random() * eU.length)]) &&
            void 0 !== e
            ? e
            : eU[0];
        },
        eH = async (e) => {
          let t = await fetch(
            "https://satellitetracker3d.nyc3.cdn.digitaloceanspaces.com/infos/".concat(
              e,
              ".json"
            )
          );
          if (!t.ok) throw Error("Network response was not ok");
          return await t.json();
        };
      var eB = (e) => {
          let { isVisible: t } = e,
            { selectedSatData: i } = eq(),
            [s, a] = (0, r.useState)(!1),
            o = i ? y(i.tle.title) : null,
            {
              data: h,
              isLoading: c,
              error: d,
            } = (0, ez.a)({
              queryKey: ["satelliteInfo", o],
              queryFn: () => eH(o),
              enabled: !!o,
              staleTime: 1 / 0,
              retry: !1,
            }),
            u = null != h ? h : eO,
            [C, p] = (0, r.useState)(null),
            [x, g] = (0, r.useState)(!1);
          return (
            (0, r.useEffect)(() => {
              o
                ? (p(
                    "https://satellitetracker3d.nyc3.cdn.digitaloceanspaces.com/thumbnails/".concat(
                      o,
                      ".jpg"
                    )
                  ),
                  a(!1),
                  g(!0))
                : (p(null), g(!1));
            }, [o]),
            (0, n.jsx)(eh.Z, {
              children: i
                ? (0, n.jsxs)(n.Fragment, {
                    children: [
                      (0, n.jsx)(ex.Z, {
                        variant: "body1",
                        color: "primary.main",
                        children: l(i.tle),
                      }),
                      (0, n.jsxs)(eh.Z, {
                        sx: { marginTop: "20px" },
                        children: [
                          x && (0, n.jsx)(eA, { isLoading: !0 }),
                          C &&
                            (0, n.jsx)("img", {
                              src: C,
                              alt: "Satellite Image",
                              onError: () => {
                                s ? g(!1) : (p(eN()), a(!0), g(!0));
                              },
                              onLoad: () => {
                                g(!1);
                              },
                              style: {
                                display: "block",
                                maxWidth: "100%",
                                maxHeight: "400px",
                                width: "auto",
                                height: "auto",
                                margin: "0 auto",
                              },
                            }),
                          c
                            ? (0, n.jsx)(eh.Z, {
                                sx: {
                                  minHeight: "150px",
                                  position: "relative",
                                },
                                children: (0, n.jsx)(eA, { isLoading: !0 }),
                              })
                            : (0, n.jsxs)(n.Fragment, {
                                children: [
                                  (0, n.jsx)(ex.Z, {
                                    variant: "caption",
                                    sx: { margin: "20px 0 10px 0" },
                                    children:
                                      u.imageTitle ||
                                      "Illustration of a satellite",
                                  }),
                                  (0, n.jsx)(ev.Z, {
                                    sx: { margin: "20px 0" },
                                  }),
                                  (0, n.jsx)(ex.Z, {
                                    variant: "body1",
                                    children:
                                      u.description ||
                                      "Description unavailable at this moment.",
                                  }),
                                  u.description &&
                                    (0, n.jsxs)(n.Fragment, {
                                      children: [
                                        (0, n.jsx)(ev.Z, {
                                          sx: { margin: "20px 0" },
                                        }),
                                        (0, n.jsx)(ex.Z, {
                                          variant: "caption",
                                          fontStyle: "italic",
                                          sx: { margin: "20px 0 10px 0" },
                                          children:
                                            "Reader's Note: The information provided here was summarized using ChatGPT version GPT-4 based on web sources. For complete accuracy, please refer to official sources.",
                                        }),
                                      ],
                                    }),
                                ],
                              }),
                        ],
                      }),
                    ],
                  })
                : (0, n.jsx)(ex.Z, {
                    variant: "body1",
                    children: "Search or select a satellite to view details.",
                  }),
            })
          );
        },
        eW = () =>
          (0, n.jsxs)(eh.Z, {
            children: [
              (0, n.jsxs)(ex.Z, {
                variant: "h5",
                sx: { marginBottom: "20px" },
                children: [
                  "Support",
                  " ",
                  (0, n.jsx)(eh.Z, {
                    component: "span",
                    sx: { color: "primary.main" },
                    children: "Satellite\xa0Tracker\xa03D",
                  }),
                ],
              }),
              (0, n.jsx)(ex.Z, {
                children:
                  "Developing and maintaining Satellite Tracker 3D is a passion project that requires ongoing resources. Every donation goes directly into covering hosting, development, and continual improvements to provide the best real-time satellite tracking experience.",
              }),
              (0, n.jsx)(ex.Z, {
                sx: { margin: "20px 0" },
                children:
                  "If you've enjoyed tracking satellites or found this tool valuable, please consider supporting my work. Your support allows me to dedicate time and resources to enhancing Satellite Tracker 3D, adding more features, and ensuring smooth performance.",
              }),
              (0, n.jsx)(ex.Z, {
                variant: "h6",
                sx: { marginBottom: "10px" },
                children: "Buy Me a Coffee",
              }),
              (0, n.jsx)(eh.Z, {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                sx: { margin: "20px 0" },
                children: (0, n.jsx)("img", {
                  src: "/bmc_qr.png",
                  alt: "Support QR Code",
                  style: { width: "200px", height: "200px" },
                }),
              }),
              (0, n.jsx)(ex.Z, {
                children:
                  "Scan the QR code or click the link below to make a donation. Every little bit helps, and I'm incredibly grateful for your support!",
              }),
              (0, n.jsx)(eP.Z, {
                href: "https://buymeacoffee.com/marko.andlar",
                target: "_blank",
                rel: "noopener noreferrer",
                sx: { display: "block", marginTop: "10px", fontWeight: "bold" },
                children: "buymeacoffee.com/marko.andlar",
              }),
              (0, n.jsx)(ev.Z, { sx: { margin: "20px 0" } }),
              (0, n.jsx)(ex.Z, { variant: "h6", children: "Connect with Me" }),
              (0, n.jsxs)(en.Z, {
                container: !0,
                direction: "row",
                spacing: 1,
                children: [
                  (0, n.jsx)(en.Z, {
                    children: (0, n.jsx)(eL.Z, {
                      href: "https://www.linkedin.com/in/marko-andlar-645524212",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      children: (0, n.jsx)(eM.Z, {}),
                    }),
                  }),
                  (0, n.jsx)(en.Z, {
                    children: (0, n.jsx)(eL.Z, {
                      href: "https://discord.gg/R8RfQN9BNv",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      children: (0, n.jsx)(ek, {}),
                    }),
                  }),
                  (0, n.jsx)(en.Z, {
                    children: (0, n.jsx)(eL.Z, {
                      href: "https://x.com/sattrack3d",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      children: (0, n.jsx)(eS.Z, {}),
                    }),
                  }),
                ],
              }),
              (0, n.jsx)(ev.Z, { sx: { margin: "20px 0" } }),
              (0, n.jsx)(ex.Z, {
                variant: "caption",
                sx: { fontStyle: "italic" },
                children:
                  "Your support fuels the future of satellite tracking. Thank you!",
              }),
            ],
          });
      let eY = {
        SATELLITE: "SATELLITE",
        CHART: "CHART",
        INFO: "INFO",
        SUPPORT: "SUPPORT",
      };
      var eX = () => {
          let { panel: e, isPanelVisible: t } = eq();
          return (0, n.jsxs)(en.Z, {
            container: !0,
            wrap: "nowrap",
            direction: "column",
            sx: { width: "100%", height: "100%" },
            children: [
              (0, n.jsx)(en.Z, {
                size: 12,
                flexShrink: 0,
                children: (0, n.jsx)(ep, {}),
              }),
              (0, n.jsxs)(en.Z, {
                size: 12,
                flexGrow: 1,
                children: [
                  (0, n.jsx)(eD, {
                    isVisible: e === eY.INFO,
                    children: (0, n.jsx)(eR, {}),
                  }),
                  (0, n.jsx)(eD, {
                    isVisible: e === eY.SUPPORT,
                    children: (0, n.jsx)(eW, {}),
                  }),
                  (0, n.jsx)(eD, {
                    isVisible: e === eY.CHART,
                    children:
                      e === eY.CHART &&
                      t &&
                      (0, n.jsx)(eZ, { isVisible: e === eY.CHART }),
                  }),
                  (0, n.jsx)(eD, {
                    isVisible: e === eY.SATELLITE,
                    children:
                      e === eY.SATELLITE &&
                      t &&
                      (0, n.jsx)(eB, { isVisible: e === eY.SATELLITE }),
                  }),
                ],
              }),
            ],
          });
        },
        eq = (0, es.Ue)((e) => ({
          engineContainer: null,
          setEngineContainer: (t) => e({ engineContainer: t }),
          data: {
            tles: [],
            satRecs: [],
            noradIdToIndex: new Map(),
            displayNameToIndex: new Map(),
          },
          setData: (t) => e({ data: t }),
          isTransitioning: !1,
          setIsTransitioning: (t) => e({ isTransitioning: t }),
          isPanelVisible: !1,
          setIsPanelVisible: (t) => e({ isPanelVisible: t }),
          panel: eY.SATELLITE,
          setPanel: (t) => e({ panel: t }),
          selectedSatData: void 0,
          setSelectedSatData: (t) => e({ selectedSatData: t }),
        })),
        eQ = () => {
          let { engineContainer: e } = eq(),
            { data: t } = eq();
          if (!e) throw Error("Engine container ref not set");
          return ei(e, t), null;
        },
        eK = (e) => {
          let { children: t, onMouseMove: i } = e,
            { engineContainer: s } = eq(),
            [a, l] = (0, r.useState)({ x: 0, y: 0 }),
            o = (0, r.useRef)(null);
          return (
            (0, r.useEffect)(() => {
              if (!s) return;
              let e = (e) => {
                i(e), l({ x: e.clientX, y: e.clientY });
              };
              return (
                s.addEventListener("mousemove", e),
                () => {
                  s.removeEventListener("mousemove", e);
                }
              );
            }, [s]),
            (0, n.jsx)("div", {
              ref: o,
              style: {
                position: "absolute",
                right: "calc(100% - ".concat(
                  (() => {
                    if (null === o.current || null === s) return 0;
                    let e = o.current.clientWidth,
                      t = s.getBoundingClientRect(),
                      i = a.x - t.left,
                      n = e - -10,
                      r = t.width - -10;
                    return i > r ? r : i < n ? n : i;
                  })(),
                  "px)"
                ),
                top: "".concat(
                  (() => {
                    if (null === o.current || null === s) return 0;
                    let e = o.current.clientHeight,
                      t = s.getBoundingClientRect(),
                      i = a.y - e / 2 + -10 - t.top,
                      n = e / 2,
                      r = t.width - e / 2;
                    return i > r ? r : i < n ? n : i;
                  })(),
                  "px"
                ),
                pointerEvents: "none",
                transform: "translateX(".concat(-10, "px) translateY(-50%)"),
                whiteSpace: "nowrap",
              },
              children: t,
            })
          );
        },
        eG = () => {
          let { engineContainer: e } = eq(),
            [t, i] = (0, r.useState)(!1),
            s = {
              title: "None",
              line1: "",
              line2: "",
              no: 1,
              count: 1,
              default: !0,
            },
            [a, o] = (0, r.useState)(s);
          return (
            (0, r.useEffect)(() => {
              let e = (e) => {
                var t, i;
                o(
                  null !==
                    (i =
                      null === (t = e.detail) || void 0 === t
                        ? void 0
                        : t.tle) && void 0 !== i
                    ? i
                    : s
                );
              };
              return (
                window.addEventListener(D, e),
                () => {
                  window.removeEventListener(D, e);
                }
              );
            }, []),
            (0, n.jsx)(eK, {
              onMouseMove: (t) => {
                var s;
                i(
                  (null ===
                    (s = document.elementFromPoint(t.clientX, t.clientY)) ||
                  void 0 === s
                    ? void 0
                    : s.parentElement) === e
                );
              },
              children: (0, n.jsx)(eh.Z, {
                sx: t && !a.default ? {} : { visibility: "hidden" },
                children: (0, n.jsx)(eT.Z, {
                  variant: "outlined",
                  sx: {
                    padding: "10px",
                    border: "1px solid",
                    borderColor: "primary.main",
                    overflow: "clip",
                  },
                  children: (0, n.jsx)(ex.Z, {
                    sx: { color: "primary.main" },
                    variant: "body2",
                    children: l(a),
                  }),
                }),
              }),
            })
          );
        },
        eV = i(1754),
        e$ = i(8444),
        eJ = i(6795),
        e1 = (e) =>
          (0, n.jsxs)("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "64",
            zoomAndPan: "magnify",
            viewBox: "0 0 375 374.999991",
            height: "64",
            preserveAspectRatio: "xMidYMid meet",
            version: "1.0",
            children: [
              (0, n.jsxs)("defs", {
                children: [
                  (0, n.jsx)("clipPath", {
                    id: "7533055509",
                    children: (0, n.jsx)("path", {
                      d: "M 187.5 0 C 291.054688 0 375 83.945312 375 187.5 C 375 291.054688 291.054688 375 187.5 375 C 83.945312 375 0 291.054688 0 187.5 C 0 83.945312 83.945312 0 187.5 0 Z M 187.5 0 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "97e937f8ca",
                    children: (0, n.jsx)("path", {
                      d: "M 95.253906 86.945312 L 272.273438 86.945312 L 272.273438 263.964844 L 95.253906 263.964844 Z M 95.253906 86.945312 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "2c27ec0d0a",
                    children: (0, n.jsx)("path", {
                      d: "M 183.765625 86.945312 C 134.882812 86.945312 95.253906 126.574219 95.253906 175.457031 C 95.253906 224.339844 134.882812 263.964844 183.765625 263.964844 C 232.648438 263.964844 272.273438 224.339844 272.273438 175.457031 C 272.273438 126.574219 232.648438 86.945312 183.765625 86.945312 Z M 183.765625 86.945312 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "2abb416fcc",
                    children: (0, n.jsx)("path", {
                      d: "M 45.070312 54.277344 L 295.570312 54.277344 L 295.570312 305 L 45.070312 305 Z M 45.070312 54.277344 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "a08c90939b",
                    children: (0, n.jsx)("path", {
                      d: "M 45.070312 163 L 88 163 L 88 265 L 45.070312 265 Z M 45.070312 163 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "2f67c07f97",
                    children: (0, n.jsx)("path", {
                      d: "M 260 184 L 295.570312 184 L 295.570312 206 L 260 206 Z M 260 184 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "412853d661",
                    children: (0, n.jsx)("path", {
                      d: "M 19 51 L 353.035156 51 L 353.035156 309.929688 L 19 309.929688 Z M 19 51 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "a92d5c2da4",
                    children: (0, n.jsx)("path", {
                      d: "M 252.589844 131.664062 L 302.253906 131.664062 L 302.253906 181.324219 L 252.589844 181.324219 Z M 252.589844 131.664062 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "b4b6473b0e",
                    children: (0, n.jsx)("path", {
                      d: "M 277.421875 131.664062 C 263.707031 131.664062 252.589844 142.78125 252.589844 156.492188 C 252.589844 170.207031 263.707031 181.324219 277.421875 181.324219 C 291.132812 181.324219 302.253906 170.207031 302.253906 156.492188 C 302.253906 142.78125 291.132812 131.664062 277.421875 131.664062 Z M 277.421875 131.664062 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "21e144dabb",
                    children: (0, n.jsx)("path", {
                      d: "M 64.648438 48.894531 L 89.210938 48.894531 L 89.210938 73.457031 L 64.648438 73.457031 Z M 64.648438 48.894531 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "f607a430f4",
                    children: (0, n.jsx)("path", {
                      d: "M 76.929688 48.894531 C 70.144531 48.894531 64.648438 54.394531 64.648438 61.175781 C 64.648438 67.960938 70.144531 73.457031 76.929688 73.457031 C 83.710938 73.457031 89.210938 67.960938 89.210938 61.175781 C 89.210938 54.394531 83.710938 48.894531 76.929688 48.894531 Z M 76.929688 48.894531 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "2b815840fd",
                    children: (0, n.jsx)("path", {
                      d: "M 262.382812 275.679688 L 313.957031 275.679688 L 313.957031 327.253906 L 262.382812 327.253906 Z M 262.382812 275.679688 ",
                      clipRule: "nonzero",
                    }),
                  }),
                  (0, n.jsx)("clipPath", {
                    id: "b653580005",
                    children: (0, n.jsx)("path", {
                      d: "M 288.171875 275.679688 C 273.929688 275.679688 262.382812 287.226562 262.382812 301.464844 C 262.382812 315.707031 273.929688 327.253906 288.171875 327.253906 C 302.414062 327.253906 313.957031 315.707031 313.957031 301.464844 C 313.957031 287.226562 302.414062 275.679688 288.171875 275.679688 Z M 288.171875 275.679688 ",
                      clipRule: "nonzero",
                    }),
                  }),
                ],
              }),
              (0, n.jsx)("g", {
                clipPath: "url(#7533055509)",
                children: (0, n.jsx)("rect", {
                  x: "-37.5",
                  width: "450",
                  fill: "#141414",
                  y: "-37.499999",
                  height: "449.999989",
                  fillOpacity: "1",
                }),
              }),
              (0, n.jsx)("g", {
                clipPath: "url(#97e937f8ca)",
                children: (0, n.jsx)("g", {
                  clipPath: "url(#2c27ec0d0a)",
                  children: (0, n.jsx)("path", {
                    fill: "#141414",
                    d: "M 95.253906 86.945312 L 272.273438 86.945312 L 272.273438 263.964844 L 95.253906 263.964844 Z M 95.253906 86.945312 ",
                    fillOpacity: "1",
                    fillRule: "nonzero",
                  }),
                }),
              }),
              (0, n.jsx)("g", {
                clipPath: "url(#2abb416fcc)",
                children: (0, n.jsx)("path", {
                  fill: "#32639b",
                  d: "M 295.523438 179.46875 C 295.523438 181.515625 295.472656 183.566406 295.371094 185.609375 C 295.269531 187.65625 295.121094 189.699219 294.917969 191.738281 C 294.71875 193.777344 294.46875 195.8125 294.167969 197.835938 C 293.867188 199.863281 293.515625 201.882812 293.117188 203.890625 C 292.71875 205.902344 292.269531 207.898438 291.769531 209.886719 C 291.273438 211.875 290.726562 213.847656 290.132812 215.808594 C 289.535156 217.769531 288.894531 219.714844 288.203125 221.644531 C 287.511719 223.574219 286.777344 225.484375 285.992188 227.378906 C 285.207031 229.269531 284.378906 231.140625 283.5 232.996094 C 282.625 234.847656 281.703125 236.675781 280.738281 238.484375 C 279.773438 240.289062 278.761719 242.070312 277.710938 243.828125 C 276.65625 245.585938 275.558594 247.316406 274.421875 249.019531 C 273.285156 250.722656 272.105469 252.398438 270.882812 254.042969 C 269.664062 255.691406 268.402344 257.304688 267.101562 258.890625 C 265.804688 260.472656 264.464844 262.023438 263.089844 263.542969 C 261.710938 265.058594 260.300781 266.542969 258.851562 267.992188 C 257.402344 269.441406 255.917969 270.851562 254.402344 272.230469 C 252.882812 273.605469 251.332031 274.941406 249.746094 276.242188 C 248.164062 277.542969 246.546875 278.800781 244.902344 280.023438 C 243.257812 281.242188 241.582031 282.421875 239.878906 283.5625 C 238.175781 284.699219 236.445312 285.796875 234.6875 286.847656 C 232.929688 287.902344 231.148438 288.910156 229.339844 289.878906 C 227.53125 290.84375 225.703125 291.765625 223.851562 292.640625 C 222 293.515625 220.125 294.347656 218.234375 295.128906 C 216.339844 295.914062 214.429688 296.652344 212.5 297.339844 C 210.570312 298.03125 208.625 298.675781 206.664062 299.269531 C 204.703125 299.863281 202.730469 300.410156 200.742188 300.90625 C 198.753906 301.40625 196.753906 301.855469 194.746094 302.253906 C 192.734375 302.652344 190.71875 303.003906 188.691406 303.304688 C 186.664062 303.605469 184.632812 303.855469 182.59375 304.058594 C 180.550781 304.257812 178.511719 304.410156 176.464844 304.507812 C 174.417969 304.609375 172.367188 304.660156 170.320312 304.660156 C 168.269531 304.660156 166.222656 304.609375 164.175781 304.507812 C 162.128906 304.410156 160.085938 304.257812 158.046875 304.058594 C 156.007812 303.855469 153.976562 303.605469 151.949219 303.304688 C 149.921875 303.003906 147.902344 302.652344 145.894531 302.253906 C 143.882812 301.855469 141.886719 301.40625 139.898438 300.90625 C 137.910156 300.410156 135.9375 299.863281 133.976562 299.269531 C 132.015625 298.675781 130.070312 298.03125 128.140625 297.339844 C 126.210938 296.652344 124.300781 295.914062 122.40625 295.128906 C 120.515625 294.347656 118.640625 293.515625 116.789062 292.640625 C 114.9375 291.765625 113.105469 290.84375 111.300781 289.878906 C 109.492188 288.910156 107.710938 287.902344 105.953125 286.847656 C 104.195312 285.796875 102.464844 284.699219 100.761719 283.5625 C 99.058594 282.421875 97.382812 281.242188 95.738281 280.023438 C 94.089844 278.800781 92.476562 277.542969 90.890625 276.242188 C 89.308594 274.941406 87.757812 273.605469 86.238281 272.230469 C 84.722656 270.851562 83.238281 269.441406 81.789062 267.992188 C 80.339844 266.542969 78.925781 265.058594 77.550781 263.542969 C 76.175781 262.023438 74.835938 260.472656 73.535156 258.890625 C 72.238281 257.304688 70.976562 255.691406 69.757812 254.042969 C 68.535156 252.398438 67.355469 250.722656 66.21875 249.019531 C 65.078125 247.316406 63.984375 245.585938 62.929688 243.828125 C 61.875 242.070312 60.867188 240.289062 59.902344 238.484375 C 58.933594 236.675781 58.015625 234.847656 57.136719 232.996094 C 56.261719 231.140625 55.433594 229.269531 54.648438 227.378906 C 53.863281 225.484375 53.125 223.574219 52.4375 221.644531 C 51.746094 219.714844 51.101562 217.769531 50.507812 215.808594 C 49.914062 213.847656 49.367188 211.875 48.871094 209.886719 C 48.371094 207.898438 47.921875 205.902344 47.523438 203.890625 C 47.125 201.882812 46.773438 199.863281 46.472656 197.835938 C 46.171875 195.8125 45.921875 193.777344 45.71875 191.738281 C 45.519531 189.699219 45.367188 187.65625 45.269531 185.613281 C 45.167969 183.566406 45.117188 181.515625 45.117188 179.46875 C 45.117188 177.417969 45.167969 175.371094 45.269531 173.324219 C 45.367188 171.277344 45.519531 169.238281 45.71875 167.199219 C 45.921875 165.160156 46.171875 163.125 46.472656 161.097656 C 46.773438 159.074219 47.125 157.054688 47.523438 155.042969 C 47.921875 153.035156 48.371094 151.035156 48.871094 149.050781 C 49.367188 147.0625 49.914062 145.089844 50.507812 143.128906 C 51.101562 141.167969 51.746094 139.222656 52.4375 137.292969 C 53.125 135.363281 53.863281 133.453125 54.648438 131.558594 C 55.433594 129.667969 56.261719 127.792969 57.136719 125.941406 C 58.015625 124.089844 58.933594 122.261719 59.902344 120.453125 C 60.867188 118.648438 61.875 116.863281 62.929688 115.105469 C 63.984375 113.351562 65.078125 111.621094 66.21875 109.917969 C 67.355469 108.210938 68.535156 106.539062 69.757812 104.890625 C 70.976562 103.246094 72.238281 101.632812 73.535156 100.046875 C 74.835938 98.464844 76.175781 96.914062 77.550781 95.394531 C 78.925781 93.878906 80.339844 92.394531 81.789062 90.945312 C 83.238281 89.496094 84.722656 88.082031 86.238281 86.707031 C 87.757812 85.332031 89.308594 83.996094 90.890625 82.695312 C 92.476562 81.394531 94.089844 80.132812 95.738281 78.914062 C 97.382812 77.695312 99.058594 76.515625 100.761719 75.375 C 102.464844 74.238281 104.195312 73.140625 105.953125 72.089844 C 107.710938 71.035156 109.492188 70.027344 111.300781 69.058594 C 113.105469 68.09375 114.9375 67.171875 116.789062 66.296875 C 118.640625 65.421875 120.515625 64.589844 122.40625 63.808594 C 124.300781 63.023438 126.210938 62.285156 128.140625 61.59375 C 130.070312 60.90625 132.015625 60.261719 133.976562 59.667969 C 135.9375 59.074219 137.910156 58.527344 139.898438 58.027344 C 141.886719 57.53125 143.882812 57.082031 145.894531 56.683594 C 147.902344 56.285156 149.921875 55.933594 151.949219 55.632812 C 153.976562 55.332031 156.007812 55.082031 158.046875 54.878906 C 160.085938 54.679688 162.128906 54.527344 164.175781 54.429688 C 166.222656 54.328125 168.269531 54.277344 170.320312 54.277344 C 172.367188 54.277344 174.417969 54.328125 176.464844 54.429688 C 178.511719 54.527344 180.550781 54.679688 182.59375 54.878906 C 184.632812 55.082031 186.664062 55.332031 188.691406 55.632812 C 190.71875 55.933594 192.734375 56.285156 194.746094 56.683594 C 196.753906 57.082031 198.753906 57.53125 200.742188 58.027344 C 202.730469 58.527344 204.703125 59.074219 206.664062 59.667969 C 208.625 60.261719 210.570312 60.90625 212.5 61.59375 C 214.429688 62.285156 216.339844 63.023438 218.234375 63.808594 C 220.125 64.589844 222 65.421875 223.851562 66.296875 C 225.703125 67.171875 227.53125 68.09375 229.339844 69.058594 C 231.148438 70.027344 232.929688 71.035156 234.6875 72.089844 C 236.445312 73.140625 238.175781 74.238281 239.878906 75.375 C 241.582031 76.515625 243.257812 77.695312 244.902344 78.914062 C 246.546875 80.132812 248.164062 81.394531 249.746094 82.695312 C 251.332031 83.996094 252.882812 85.332031 254.402344 86.707031 C 255.917969 88.082031 257.402344 89.496094 258.851562 90.945312 C 260.300781 92.394531 261.710938 93.878906 263.089844 95.394531 C 264.464844 96.914062 265.804688 98.464844 267.101562 100.046875 C 268.402344 101.632812 269.664062 103.246094 270.882812 104.890625 C 272.105469 106.539062 273.285156 108.210938 274.421875 109.917969 C 275.558594 111.621094 276.65625 113.351562 277.710938 115.105469 C 278.761719 116.863281 279.773438 118.648438 280.738281 120.453125 C 281.703125 122.261719 282.625 124.089844 283.5 125.941406 C 284.378906 127.792969 285.207031 129.667969 285.992188 131.558594 C 286.777344 133.453125 287.511719 135.363281 288.203125 137.292969 C 288.894531 139.222656 289.535156 141.167969 290.132812 143.128906 C 290.726562 145.089844 291.273438 147.0625 291.769531 149.050781 C 292.269531 151.035156 292.71875 153.035156 293.117188 155.042969 C 293.515625 157.054688 293.867188 159.074219 294.167969 161.097656 C 294.46875 163.125 294.71875 165.160156 294.917969 167.199219 C 295.121094 169.238281 295.269531 171.277344 295.371094 173.324219 C 295.472656 175.371094 295.523438 177.417969 295.523438 179.46875 Z M 295.523438 179.46875 ",
                  fillOpacity: "1",
                  fillRule: "nonzero",
                }),
              }),
              (0, n.jsx)("path", {
                fill: "#2a578c",
                d: "M 116.929688 218.808594 C 119.285156 219.527344 121.636719 220.214844 123.824219 221.390625 C 125.347656 222.210938 126.972656 222.605469 128.699219 222.570312 C 129.21875 222.519531 129.734375 222.570312 130.265625 222.472656 C 131.996094 222.171875 133.507812 221.375 135.019531 220.539062 C 137.257812 219.304688 139.417969 217.960938 141.292969 216.203125 C 142.289062 215.273438 142.546875 213.804688 142.019531 212.824219 C 141.445312 211.769531 139.992188 211.191406 138.640625 211.515625 C 137.589844 211.75 136.574219 212.089844 135.589844 212.535156 C 134.15625 213.210938 132.722656 213.929688 131.105469 214.15625 C 129.4375 214.394531 127.789062 214.957031 126.101562 214.746094 C 123.191406 214.382812 120.414062 213.265625 117.4375 213.183594 C 116.035156 213.144531 114.675781 212.609375 113.242188 212.734375 C 112.140625 212.824219 111.136719 213.46875 110.886719 214.347656 C 110.675781 215.089844 111.160156 215.980469 112.070312 216.640625 C 113.539062 217.710938 115.226562 218.285156 116.929688 218.808594 Z M 116.929688 218.808594 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#2a578c",
                d: "M 102.671875 222.378906 C 100.191406 222.3125 97.710938 222.375 95.234375 222.570312 C 93.605469 222.695312 92.511719 223.636719 91.902344 225.121094 C 91.347656 226.484375 92.007812 227.496094 92.964844 228.378906 C 94.523438 229.8125 96.464844 230.566406 98.429688 231.179688 C 101.503906 232.144531 104.421875 233.410156 107.132812 235.144531 C 109.8125 236.867188 112.53125 238.515625 115.710938 239.105469 C 118.617188 239.644531 121.503906 240.507812 124.519531 239.886719 C 124.683594 239.851562 124.875 239.925781 125.054688 239.953125 C 127.292969 240.316406 129.546875 240.566406 131.8125 240.703125 C 135.667969 240.902344 139.394531 240.148438 143.035156 238.941406 C 147.636719 237.414062 152.078125 235.5 156.175781 232.90625 C 160.148438 230.382812 164.042969 227.722656 166.867188 223.820312 C 167.734375 222.621094 168.574219 221.429688 168.890625 219.929688 C 169.285156 218.039062 168.492188 216.460938 166.804688 216.144531 C 165.886719 215.972656 164.980469 216.316406 164.125 216.644531 C 160.765625 217.921875 157.679688 219.726562 154.792969 221.835938 C 149.542969 225.667969 143.683594 227.398438 137.230469 227.175781 C 134.9375 227.09375 132.640625 226.777344 130.347656 226.648438 C 127.867188 226.5 125.40625 226.210938 122.957031 225.777344 C 119.144531 225.113281 115.414062 224.105469 111.707031 222.980469 C 108.898438 222.128906 105.972656 222.378906 102.671875 222.378906 Z M 102.671875 222.378906 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#2a578c",
                d: "M 288.65625 217.953125 C 287.300781 219.503906 285.988281 221.105469 284.5 222.523438 C 282.207031 224.6875 279.265625 225.757812 276.328125 226.644531 C 273.601562 227.464844 270.765625 227.859375 267.953125 228.320312 C 266.179688 228.609375 264.558594 229.183594 264.332031 231.363281 C 264.308594 231.488281 264.261719 231.601562 264.1875 231.699219 C 263.59375 232.601562 263.921875 233.316406 264.617188 233.996094 C 265.121094 234.484375 265.734375 234.761719 266.375 234.980469 C 268.886719 235.851562 271.519531 235.789062 274.117188 235.882812 C 276.476562 235.945312 278.742188 236.445312 280.910156 237.378906 L 281.273438 237.542969 C 284.796875 230.828125 287.679688 223.851562 289.929688 216.609375 C 289.484375 217.039062 289.066406 217.488281 288.65625 217.953125 Z M 288.65625 217.953125 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#2a578c",
                d: "M 230.609375 289.210938 C 229.59375 289.300781 228.578125 289.277344 227.558594 289.402344 C 224.730469 289.769531 221.929688 290.292969 219.160156 290.976562 C 215.046875 291.960938 210.941406 292.984375 206.761719 293.667969 C 205.246094 293.90625 203.71875 294.039062 202.183594 294.0625 C 201.164062 294.082031 200.167969 294.292969 199.152344 294.269531 C 192 294.113281 184.976562 293.183594 178.140625 290.957031 C 171.890625 288.941406 166.039062 286.105469 160.582031 282.457031 C 158.089844 280.785156 155.792969 278.820312 153.421875 276.96875 C 150.492188 274.667969 147.40625 272.597656 144.167969 270.753906 C 141.136719 269.03125 137.980469 267.582031 134.695312 266.410156 C 132.453125 265.636719 130.160156 265.097656 127.8125 264.789062 C 121.820312 263.957031 116.265625 265.5625 110.875 267.84375 C 105.664062 270.050781 100.496094 272.355469 95.175781 274.304688 C 93.714844 274.824219 92.34375 275.515625 91.054688 276.378906 C 93.457031 278.339844 95.925781 280.210938 98.464844 281.988281 C 101.003906 283.765625 103.605469 285.449219 106.269531 287.035156 C 108.933594 288.621094 111.652344 290.105469 114.425781 291.488281 C 117.199219 292.871094 120.019531 294.148438 122.886719 295.324219 C 125.757812 296.5 128.664062 297.5625 131.613281 298.523438 C 134.5625 299.480469 137.539062 300.328125 140.550781 301.066406 C 143.5625 301.804688 146.597656 302.425781 149.652344 302.9375 C 152.710938 303.449219 155.78125 303.847656 158.871094 304.132812 C 161.957031 304.417969 165.050781 304.585938 168.148438 304.640625 C 171.25 304.695312 174.34375 304.632812 177.441406 304.457031 C 180.535156 304.28125 183.621094 303.992188 186.691406 303.589844 C 189.765625 303.183594 192.820312 302.667969 195.855469 302.035156 C 198.890625 301.402344 201.898438 300.660156 204.875 299.808594 C 207.855469 298.953125 210.800781 297.988281 213.707031 296.914062 C 216.617188 295.84375 219.480469 294.664062 222.300781 293.378906 C 225.121094 292.09375 227.890625 290.703125 230.609375 289.214844 Z M 230.609375 289.210938 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#53cb8f",
                d: "M 257.785156 184.953125 C 256.8125 184.757812 255.828125 184.699219 254.839844 184.78125 C 250.539062 185.042969 246.308594 185.867188 242.039062 186.359375 C 240.460938 186.539062 239 186.296875 237.820312 185.015625 C 236.675781 183.761719 235.644531 182.417969 234.730469 180.988281 C 229.960938 173.554688 225.769531 165.804688 221.503906 158.085938 C 220.03125 155.414062 218.835938 152.582031 217.046875 150.097656 C 215.070312 147.347656 212.988281 144.675781 210.957031 141.960938 C 210.441406 141.253906 209.808594 140.675781 209.0625 140.222656 C 208.316406 139.769531 207.511719 139.480469 206.648438 139.347656 C 204.496094 138.992188 202.351562 139.019531 200.210938 139.425781 C 195.039062 140.371094 189.988281 141.855469 184.898438 143.160156 C 182.339844 143.820312 179.765625 144.195312 177.132812 143.972656 C 175.511719 143.863281 174.078125 143.289062 172.832031 142.253906 C 171.714844 141.324219 170.699219 140.289062 169.648438 139.296875 C 167.703125 137.464844 165.445312 135.953125 163.832031 133.765625 C 163.210938 132.921875 162.367188 132.695312 161.367188 132.96875 C 159.40625 133.503906 157.433594 133.980469 155.519531 134.664062 C 152.558594 135.722656 149.664062 137 146.636719 137.808594 C 141.953125 139.058594 137.21875 140.160156 132.441406 141.027344 C 128.960938 141.664062 126.046875 143.296875 123.871094 146.066406 C 121.273438 149.363281 118.867188 152.789062 116.652344 156.351562 C 114.605469 159.648438 113.476562 163.054688 114.535156 166.960938 C 114.710938 167.613281 114.570312 168.363281 114.277344 169.023438 C 113.4375 170.910156 112.566406 172.785156 111.742188 174.675781 C 110.542969 177.429688 109.554688 180.238281 109.660156 183.15625 C 109.660156 186.054688 109.992188 187.503906 111.394531 188.765625 C 114.800781 191.828125 117.375 195.5625 120.023438 199.230469 C 122.320312 202.398438 125.003906 205 128.753906 206.375 C 130.378906 206.972656 131.917969 207.082031 133.605469 206.550781 C 137.335938 205.371094 141.027344 204.078125 144.839844 203.203125 C 148.710938 202.316406 152.460938 202.554688 155.894531 204.675781 C 158.726562 206.425781 161.769531 207.640625 165.027344 208.324219 C 167.339844 208.820312 169.65625 209.351562 171.816406 210.367188 C 172.34375 210.617188 172.59375 210.976562 172.679688 211.5625 C 173.007812 213.921875 172.820312 216.296875 172.996094 218.667969 C 173.207031 221.445312 173.585938 224.171875 174.4375 226.816406 C 175.828125 231.15625 178.144531 235.015625 180.851562 238.632812 C 181.554688 239.570312 181.410156 240.210938 180.902344 241.082031 C 179.558594 243.375 178.199219 245.644531 177.058594 248.042969 C 176.238281 249.765625 175.71875 251.484375 175.964844 253.460938 C 176.417969 257.113281 177.15625 260.703125 178.5625 264.089844 C 181.316406 270.707031 184.921875 276.898438 188.425781 283.132812 C 189.152344 284.425781 190.363281 284.855469 191.835938 284.511719 C 192.765625 284.292969 193.699219 284.078125 194.613281 283.847656 C 197.859375 283.007812 201.109375 282.207031 204.414062 281.652344 C 206.851562 281.246094 208.949219 280.28125 210.699219 278.441406 C 214.058594 274.910156 217.53125 271.492188 220.636719 267.726562 C 223.574219 264.167969 226.3125 260.488281 228.027344 256.175781 C 229.019531 253.679688 230.65625 251.84375 232.878906 250.417969 C 234.691406 249.253906 236.4375 247.980469 238.242188 246.800781 C 239.820312 245.769531 240.695312 244.394531 240.472656 242.472656 C 240.316406 241.121094 240.339844 239.765625 240.28125 238.410156 C 240.253906 237.738281 240.15625 237.066406 240.070312 236.394531 C 239.710938 233.679688 239.011719 231.03125 238.503906 228.34375 C 238.109375 226.25 238.363281 224.34375 239.671875 222.496094 C 241.828125 219.488281 244.15625 216.617188 246.652344 213.882812 C 248.417969 211.953125 249.8125 209.785156 250.835938 207.378906 C 252.527344 203.410156 254.222656 199.441406 256.128906 195.566406 C 257.40625 192.972656 258.84375 190.441406 259.472656 187.574219 C 259.75 186.304688 259.054688 185.234375 257.785156 184.953125 Z M 257.785156 184.953125 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#53cb8f",
                d: "M 202.269531 58.394531 C 202.824219 61.976562 203.863281 65.453125 205.019531 68.890625 C 205.207031 69.445312 205.117188 69.707031 204.6875 70.011719 C 202.984375 71.199219 201.441406 72.5625 200.050781 74.105469 C 199.320312 74.917969 198.617188 75.023438 197.691406 74.585938 C 195.160156 73.390625 192.417969 73.167969 189.6875 73.042969 C 187.109375 72.925781 184.546875 73.5 181.964844 73.617188 C 180.875 73.667969 179.910156 74.148438 179.039062 74.851562 C 176.085938 77.226562 173.160156 79.632812 170.304688 82.125 C 169.308594 82.992188 168.203125 83.734375 167.1875 84.585938 C 166.003906 85.578125 165.179688 86.757812 165.445312 88.429688 C 165.609375 89.429688 165.777344 90.425781 165.917969 91.429688 C 166.148438 93.035156 166.910156 94.550781 166.738281 96.226562 C 166.613281 97.441406 166.433594 98.636719 165.234375 99.324219 C 163.386719 100.378906 161.546875 101.445312 159.683594 102.46875 C 158.660156 103.03125 158.574219 102.96875 158.277344 101.835938 C 158.246094 101.71875 158.226562 101.597656 158.210938 101.476562 C 157.839844 98.976562 157.652344 96.464844 157.644531 93.941406 C 157.644531 92.671875 157.679688 91.40625 157.644531 90.140625 C 157.621094 89.035156 156.792969 88.261719 155.703125 88.191406 C 154.800781 88.113281 153.980469 88.335938 153.242188 88.855469 C 150.671875 90.707031 147.78125 91.941406 144.976562 93.355469 C 141.964844 94.875 140.914062 97.503906 141.175781 100.738281 C 141.339844 102.796875 143.058594 103.945312 145.046875 103.402344 C 145.636719 103.21875 146.191406 102.953125 146.703125 102.605469 C 147.4375 102.148438 148.171875 101.691406 148.925781 101.277344 C 149.683594 100.863281 150.503906 100.742188 151.179688 101.347656 C 152.015625 102.101562 152.9375 102.898438 152.757812 104.207031 C 152.683594 104.691406 152.648438 105.183594 152.648438 105.675781 C 152.683594 108.3125 151.519531 110.304688 149.496094 111.945312 C 147.371094 113.640625 145.097656 115.113281 142.679688 116.359375 C 141.398438 117.03125 140.601562 118.035156 140.386719 119.511719 C 139.941406 122.636719 140.597656 125.585938 141.84375 128.402344 C 142.742188 130.421875 144.425781 131.453125 146.652344 131.347656 C 147.984375 131.285156 149.234375 130.773438 150.410156 130.144531 C 153.199219 128.636719 155.339844 126.386719 157.421875 124.050781 C 159.019531 122.257812 160.484375 120.148438 163.402344 120.609375 C 163.546875 120.632812 163.703125 120.519531 163.851562 120.519531 C 165.097656 120.503906 166.386719 120.132812 167.546875 120.886719 C 169.03125 121.84375 170.398438 122.929688 171.402344 124.417969 C 173.785156 127.945312 176.328125 131.347656 179.21875 134.484375 C 180.25 135.605469 181.800781 135.503906 182.433594 134.171875 C 183.058594 132.878906 183.214844 131.527344 182.894531 130.125 C 182.605469 128.78125 181.863281 127.6875 181.125 126.597656 C 178.949219 123.441406 177.070312 120.117188 175.484375 116.628906 C 174.320312 114.039062 174.226562 113.945312 176.65625 112.421875 C 176.996094 112.207031 177.382812 112.054688 177.679688 111.796875 C 178.347656 111.222656 178.871094 111.476562 179.449219 111.949219 C 180.855469 113.097656 182.273438 114.226562 183.710938 115.34375 C 186.046875 117.152344 188.179688 119.132812 189.589844 121.773438 C 190.464844 123.402344 191.320312 125.042969 192.347656 126.589844 C 193.722656 128.648438 195.574219 129.933594 197.984375 130.457031 C 199.605469 130.8125 201.265625 131.058594 202.828125 131.59375 C 208.976562 133.714844 215.273438 133.714844 221.632812 133.078125 C 223.269531 132.914062 223.726562 133.296875 224.210938 134.894531 C 224.824219 136.898438 224.546875 138.867188 224.070312 140.8125 C 223.128906 144.613281 223.1875 148.300781 224.96875 151.871094 C 225.996094 153.941406 226.976562 156.03125 228 158.109375 C 229.863281 161.871094 232.070312 165.4375 234.164062 169.066406 C 235.648438 171.628906 236.898438 174.316406 238.496094 176.808594 C 240.992188 180.71875 245.59375 181.140625 249.09375 179.289062 C 252.773438 177.34375 255.890625 174.621094 258.984375 171.878906 C 261.855469 169.335938 264.019531 166.222656 266.125 163.058594 C 267 161.742188 267.5 160.3125 267.34375 158.699219 C 267.289062 158.125 267.199219 157.539062 267.175781 156.957031 C 267.117188 155.332031 266.539062 154.0625 265.195312 153.007812 C 262.457031 150.855469 259.605469 149.597656 255.996094 150.402344 C 254.460938 150.746094 252.808594 150.53125 251.25 150.015625 C 248.421875 149.085938 246.234375 147.34375 244.53125 144.917969 C 244.019531 144.214844 243.675781 143.4375 243.503906 142.582031 C 243.3125 141.59375 244.011719 140.71875 244.878906 140.859375 C 247.148438 141.238281 249.398438 141.710938 251.679688 142.046875 C 253.636719 142.335938 255.585938 142.515625 257.535156 142.269531 C 258.484375 142.148438 259.433594 142.191406 260.382812 142.035156 C 262.171875 141.742188 263.96875 141.421875 265.796875 141.59375 C 266.867188 141.695312 267.992188 141.847656 268.808594 142.613281 C 269.746094 143.507812 270.617188 144.460938 271.421875 145.480469 C 274.601562 149.496094 277.332031 153.828125 280.363281 157.945312 C 282.742188 161.175781 283.914062 164.972656 285.523438 168.554688 C 286.230469 170.125 286.84375 171.753906 288.105469 173.007812 C 289.804688 174.691406 292.011719 174.179688 292.714844 171.882812 C 293.179688 170.371094 293 168.8125 292.613281 167.320312 C 291.433594 162.730469 290.417969 158.136719 290.070312 153.382812 C 289.820312 149.914062 289.601562 146.445312 289.414062 142.976562 C 289.359375 141.972656 289.25 140.96875 289.128906 139.964844 C 275.914062 100.117188 243.1875 69.160156 202.269531 58.394531 Z M 202.269531 58.394531 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#53cb8f",
                d: "M 147.601562 83.953125 C 149.074219 84.195312 150.804688 83.925781 152.460938 84.21875 C 154.582031 84.597656 155.367188 82.902344 155.113281 81.421875 C 154.828125 79.738281 153.746094 78.703125 152.375 77.90625 C 151.582031 77.445312 150.636719 77.203125 149.917969 76.65625 C 147.988281 75.1875 145.984375 75.03125 143.847656 76.042969 C 142.644531 76.613281 141.554688 77.363281 140.464844 78.128906 C 139.410156 78.859375 138.550781 79.777344 137.894531 80.878906 C 137.023438 82.359375 137.5 83.621094 139.101562 84.164062 C 139.488281 84.277344 139.882812 84.332031 140.285156 84.328125 C 142.664062 84.402344 145.019531 84.066406 147.601562 83.953125 Z M 147.601562 83.953125 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#53cb8f",
                d: "M 171.648438 65.292969 C 172.652344 65.980469 173.773438 66.414062 174.878906 66.859375 C 177.117188 67.757812 179.554688 66.632812 180.453125 64.363281 C 180.980469 63.027344 180.839844 61.824219 179.738281 61.148438 C 178.402344 60.332031 177.054688 59.382812 175.417969 59.5 C 174.371094 59.492188 173.351562 59.660156 172.367188 60.011719 C 171.175781 60.402344 170.25 61.144531 170.121094 62.4375 C 169.996094 63.652344 170.632812 64.597656 171.648438 65.292969 Z M 171.648438 65.292969 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#53cb8f",
                d: "M 66.109375 110.058594 C 66.375 109.832031 66.632812 109.597656 66.890625 109.363281 C 68.585938 107.800781 70.054688 105.96875 72.074219 104.785156 C 74.976562 103.082031 78.089844 101.808594 81.21875 100.605469 C 83.425781 99.757812 85.675781 99.101562 88.140625 99.832031 C 89.421875 100.210938 90.664062 99.699219 91.683594 98.710938 C 92.8125 97.605469 93.777344 96.371094 94.582031 95.015625 C 96.613281 91.636719 98.5625 88.199219 100.714844 84.898438 C 104.332031 79.367188 109.347656 75.234375 114.621094 71.378906 C 116.546875 69.976562 118.820312 69.171875 120.867188 67.980469 C 125.152344 65.503906 129.289062 62.796875 133.269531 59.851562 C 105.519531 68.433594 81.898438 86.40625 66.109375 110.058594 Z M 66.109375 110.058594 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#53cb8f",
                d: "M 140.242188 60.53125 C 137.148438 62.605469 134.203125 64.90625 131.066406 66.90625 C 125.96875 70.152344 120.839844 73.34375 116.417969 77.503906 C 115.476562 78.390625 114.574219 79.335938 113.921875 80.457031 C 112.671875 82.609375 113.84375 84.617188 116.324219 84.6875 C 117.035156 84.683594 117.734375 84.582031 118.417969 84.382812 C 122.933594 83.238281 127.085938 81.230469 131.101562 78.914062 C 133.847656 77.335938 136.363281 75.34375 139.285156 74.058594 C 141.398438 73.132812 143.527344 72.175781 145.84375 71.929688 C 147.972656 71.699219 149.972656 71.183594 151.722656 69.960938 C 154.65625 67.914062 157.691406 66.03125 160.714844 64.125 C 161.8125 63.433594 162.921875 62.765625 163.863281 61.867188 C 164.765625 61.007812 164.828125 60.054688 163.925781 59.199219 C 162.253906 57.625 160.382812 56.355469 158.105469 55.761719 C 156.902344 55.476562 155.683594 55.316406 154.445312 55.28125 C 151.382812 55.664062 148.351562 56.160156 145.359375 56.765625 C 143.644531 58.003906 142.003906 59.347656 140.242188 60.53125 Z M 140.242188 60.53125 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#53cb8f",
                d: "M 254.691406 234.425781 C 253.605469 234.28125 253.25 235.226562 252.804688 235.929688 C 251.710938 237.675781 250.65625 239.453125 249.609375 241.234375 C 249.453125 241.464844 249.25 241.648438 249 241.78125 C 247.261719 242.890625 245.535156 244.019531 243.773438 245.09375 C 241.660156 246.386719 241.339844 247.070312 241.96875 249.488281 C 242.214844 250.4375 242.179688 251.269531 241.660156 252.136719 C 240.34375 254.335938 239.390625 256.726562 238.285156 259.019531 C 237.695312 260.246094 237.902344 260.871094 239.160156 261.457031 C 240.164062 261.917969 241.210938 262.296875 242.234375 262.722656 C 243.632812 263.308594 244.707031 263.03125 245.667969 261.886719 C 246.558594 260.828125 247.410156 259.738281 248.246094 258.636719 C 249.988281 256.355469 251.667969 254.039062 252.980469 251.46875 C 254.433594 248.613281 255.703125 245.671875 257.28125 242.878906 C 257.480469 242.511719 257.597656 242.121094 257.632812 241.703125 C 257.109375 239.878906 256.636719 238.035156 256.054688 236.226562 C 255.820312 235.511719 255.683594 234.558594 254.691406 234.425781 Z M 254.691406 234.425781 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("g", {
                clipPath: "url(#a08c90939b)",
                children: (0, n.jsx)("path", {
                  fill: "#53cb8f",
                  d: "M 87.433594 244.648438 C 87.808594 243.617188 87.71875 242.65625 86.828125 241.863281 C 84.234375 239.554688 82.152344 236.789062 80.003906 234.09375 C 78.875 232.679688 78.332031 231.128906 79.011719 229.269531 C 79.367188 228.292969 79.707031 227.300781 80.0625 226.316406 C 81.125 223.40625 82.378906 220.535156 81.863281 217.300781 C 81.527344 215.199219 80.890625 213.296875 79.03125 212.019531 C 76.96875 210.601562 74.644531 209.789062 72.292969 209.035156 C 69.8125 208.242188 67.648438 207.015625 65.855469 205.046875 C 63.90625 202.914062 62.566406 200.460938 61.429688 197.839844 C 59.421875 193.238281 57.394531 188.640625 55.226562 184.109375 C 52.472656 178.351562 50.710938 172.179688 47.910156 166.441406 C 47.359375 165.320312 46.820312 164.1875 46.175781 163.125 C 45.46875 168.550781 45.117188 173.996094 45.117188 179.46875 C 45.117188 212.328125 57.777344 242.230469 78.488281 264.5625 C 78.21875 262.027344 77.859375 259.492188 78.347656 256.9375 C 78.644531 255.359375 79.332031 253.902344 80.769531 253.160156 C 84.324219 251.324219 86.132812 248.203125 87.433594 244.648438 Z M 87.433594 244.648438 ",
                  fillOpacity: "1",
                  fillRule: "nonzero",
                }),
              }),
              (0, n.jsx)("path", {
                fill: "#dfe0df",
                d: "M 68.714844 155.460938 C 73.980469 155.953125 79.25 156.023438 84.523438 155.667969 C 88.25 155.421875 91.804688 154.519531 95.082031 152.667969 C 96.375 151.9375 97.613281 151.125 98.582031 149.96875 C 99.972656 148.308594 99.667969 146.527344 97.792969 145.484375 C 96.410156 144.707031 94.949219 144.496094 93.402344 144.847656 C 90.097656 145.542969 86.808594 146.316406 83.511719 147.042969 C 79.082031 148.019531 74.777344 147.800781 70.644531 145.742188 C 68.214844 144.53125 65.738281 143.433594 63.015625 143.050781 C 59.902344 142.613281 56.796875 142.976562 53.695312 143.175781 C 52.621094 143.253906 51.546875 143.253906 50.472656 143.183594 C 49.761719 145.53125 49.121094 147.90625 48.546875 150.308594 C 54.914062 153.257812 61.691406 154.789062 68.714844 155.460938 Z M 68.714844 155.460938 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#dfe0df",
                d: "M 64.695312 132.632812 C 66.558594 132.257812 68.371094 131.96875 70.253906 132.445312 C 73.980469 133.390625 77.710938 134.296875 81.429688 135.226562 C 85.011719 136.121094 88.585938 137.035156 92.324219 136.980469 C 94.640625 136.945312 96.953125 136.882812 99.265625 136.738281 C 102.195312 136.554688 105 135.902344 107.445312 134.171875 C 109.582031 132.660156 111.535156 130.90625 113.738281 129.476562 C 115.671875 128.21875 116.738281 126.34375 117.339844 124.171875 C 117.707031 122.851562 117.390625 122.261719 116.160156 121.65625 C 114.65625 120.921875 113.148438 121.15625 111.671875 121.667969 C 108.765625 122.671875 105.878906 123.730469 102.988281 124.78125 C 97.28125 126.851562 91.433594 126.726562 85.554688 125.871094 C 82.578125 125.441406 79.820312 124.222656 77.003906 123.226562 C 73.304688 121.910156 69.59375 121.804688 65.832031 122.832031 C 63.1875 123.546875 60.535156 124.1875 57.828125 124.441406 C 56.585938 126.964844 55.429688 129.539062 54.363281 132.15625 C 57.765625 133.179688 61.210938 133.339844 64.695312 132.632812 Z M 64.695312 132.632812 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("path", {
                fill: "#dfe0df",
                d: "M 111.675781 144.203125 C 111.675781 143.058594 110.796875 142.183594 109.613281 142.160156 C 107.667969 142.125 106.304688 143.296875 106.316406 144.984375 C 106.324219 146.175781 107.148438 146.960938 108.390625 146.964844 C 110.066406 146.972656 111.667969 145.621094 111.675781 144.203125 Z M 111.675781 144.203125 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("g", {
                clipPath: "url(#2f67c07f97)",
                children: (0, n.jsx)("path", {
                  fill: "#dfe0df",
                  d: "M 291.15625 187.878906 C 289.210938 190.484375 286.710938 192.453125 283.570312 193.566406 C 281.105469 194.441406 278.710938 195.503906 276.28125 196.472656 C 274.703125 197.097656 273.070312 197.320312 271.382812 197.148438 C 268.488281 196.878906 265.671875 197.382812 262.871094 197.953125 C 260.660156 198.40625 260.167969 200.007812 261.679688 201.683594 C 264.125 204.386719 267.117188 205.792969 270.835938 205.183594 C 275.207031 204.46875 279.582031 203.742188 283.933594 202.957031 C 286.132812 202.558594 288.300781 202.8125 290.464844 203.125 C 291.394531 203.253906 292.332031 203.285156 293.269531 203.226562 C 294.476562 196.9375 295.199219 190.59375 295.433594 184.195312 C 293.738281 185.109375 292.3125 186.339844 291.15625 187.878906 Z M 291.15625 187.878906 ",
                  fillOpacity: "1",
                  fillRule: "nonzero",
                }),
              }),
              (0, n.jsx)("path", {
                fill: "#dfe0df",
                d: "M 273.558594 186.277344 C 272.429688 187.242188 271.234375 188.085938 269.847656 188.664062 C 269.058594 188.996094 268.273438 189.382812 267.753906 190.125 C 267.046875 191.148438 267.449219 192.339844 268.648438 192.675781 C 269.125 192.828125 269.613281 192.875 270.109375 192.820312 C 271.703125 192.589844 273.246094 192.191406 274.6875 191.464844 C 275.917969 190.847656 277.203125 190.578125 278.578125 190.460938 C 280.445312 190.316406 282.207031 189.769531 283.710938 188.597656 C 284.335938 188.109375 284.796875 187.503906 284.785156 186.648438 C 284.789062 186.066406 284.585938 185.566406 284.175781 185.148438 C 283.25 184.199219 282.089844 183.777344 280.796875 183.640625 C 277.957031 183.339844 275.640625 184.492188 273.558594 186.277344 Z M 273.558594 186.277344 ",
                fillOpacity: "1",
                fillRule: "nonzero",
              }),
              (0, n.jsx)("g", {
                clipPath: "url(#412853d661)",
                children: (0, n.jsx)("path", {
                  fill: "#ffffff",
                  d: "M 284.1875 235.191406 C 281.183594 233.386719 277.578125 234.589844 275.773438 237.59375 C 266.757812 253.21875 254.738281 266.441406 239.710938 276.660156 C 213.867188 294.089844 182.617188 300.699219 151.964844 295.292969 C 131.527344 291.6875 113.5 282.671875 97.871094 269.449219 L 112.898438 264.640625 C 121.3125 262.234375 129.726562 258.628906 137.539062 255.625 C 147.757812 251.417969 157.371094 246.609375 167.589844 241.199219 C 168.792969 240.597656 170.59375 239.996094 171.796875 239.398438 C 184.417969 233.988281 194.035156 227.976562 201.246094 222.566406 C 200.644531 226.175781 198.242188 233.386719 192.230469 240.597656 C 185.621094 248.410156 177.207031 251.417969 173.601562 252.621094 C 180.8125 252.621094 193.433594 252.019531 207.859375 246.007812 C 221.082031 239.996094 230.097656 231.582031 234.304688 226.773438 C 234.304688 221.367188 234.304688 205.738281 224.6875 190.714844 C 213.867188 173.886719 198.242188 167.875 192.832031 166.070312 C 186.222656 169.078125 174.800781 174.484375 164.585938 185.90625 C 151.363281 200.332031 147.15625 215.957031 145.953125 223.167969 C 147.757812 220.164062 154.367188 209.945312 167.589844 206.339844 C 173.601562 204.539062 179.007812 205.136719 182.617188 205.738281 C 174.800781 211.148438 166.386719 217.761719 157.972656 224.371094 C 148.957031 230.382812 139.941406 235.789062 130.328125 240.597656 C 123.113281 244.804688 115.300781 248.410156 107.488281 251.417969 L 87.652344 259.832031 C 83.445312 255.625 79.839844 251.417969 76.835938 246.007812 C 59.40625 220.164062 52.792969 188.910156 58.203125 158.257812 C 64.214844 127.605469 81.042969 100.5625 106.886719 83.132812 C 152.566406 51.878906 214.46875 56.6875 254.136719 95.152344 C 256.542969 97.554688 260.148438 97.554688 262.550781 95.152344 C 264.957031 92.746094 264.957031 89.140625 262.550781 86.738281 C 218.675781 44.664062 150.160156 39.257812 100.277344 73.515625 C 72.027344 92.746094 52.792969 122.199219 46.183594 156.457031 C 43.179688 171.480469 43.179688 186.507812 45.582031 201.53125 C 39.574219 208.144531 33.5625 215.355469 28.753906 223.167969 C 25.75 227.976562 23.34375 233.386719 21.542969 239.398438 C 19.738281 245.40625 18.535156 251.417969 20.339844 258.027344 C 20.941406 261.035156 22.742188 264.640625 25.148438 267.042969 C 27.550781 269.449219 30.558594 271.25 32.960938 273.054688 C 38.972656 276.058594 44.980469 277.261719 51.59375 277.261719 C 62.410156 277.863281 73.230469 276.058594 84.046875 273.65625 C 102.078125 291.085938 124.316406 302.503906 149.558594 307.3125 C 157.371094 308.515625 165.785156 309.714844 173.601562 309.714844 C 199.445312 309.714844 224.6875 301.902344 246.324219 286.878906 C 262.550781 275.457031 276.375 261.035156 285.992188 243.605469 C 288.394531 240.597656 287.195312 236.992188 284.1875 235.191406 Z M 37.167969 265.839844 C 31.757812 264.039062 28.152344 261.035156 26.949219 256.226562 C 25.148438 251.417969 25.75 246.007812 26.949219 240.597656 C 28.152344 235.191406 29.957031 229.78125 32.359375 224.371094 C 35.964844 216.558594 41.375 208.746094 46.785156 202.132812 C 49.789062 220.164062 57.003906 237.59375 67.21875 253.21875 C 69.625 256.828125 72.628906 260.433594 75.632812 264.039062 C 67.820312 266.441406 60.007812 267.644531 52.195312 268.246094 C 46.785156 268.246094 41.976562 267.644531 37.167969 265.839844 Z M 278.179688 117.390625 L 252.933594 133.617188 C 239.113281 125.203125 224.085938 124 212.667969 131.210938 C 204.855469 136.019531 200.046875 144.433594 198.242188 154.652344 C 202.449219 155.855469 207.257812 157.65625 211.464844 160.0625 C 220.480469 165.472656 228.894531 173.285156 235.503906 184.101562 C 242.117188 194.921875 245.722656 205.738281 246.925781 216.558594 C 247.527344 221.367188 246.925781 226.175781 246.324219 230.980469 C 255.941406 233.386719 265.558594 232.785156 273.972656 227.976562 C 285.390625 220.765625 290.800781 206.339844 288.996094 190.113281 L 314.238281 173.886719 C 325.660156 166.671875 334.675781 157.058594 341.285156 146.238281 C 347.898438 135.417969 352.105469 122.796875 353.304688 109.574219 C 328.0625 100.558594 300.417969 103.566406 278.179688 117.390625 Z M 285.390625 170.878906 C 275.773438 176.890625 263.753906 176.289062 258.945312 169.078125 C 254.136719 161.863281 258.34375 151.046875 268.5625 144.433594 C 278.179688 138.425781 290.199219 139.027344 295.007812 146.238281 C 299.214844 153.449219 295.609375 164.871094 285.390625 170.878906 Z M 285.390625 170.878906 ",
                  fillOpacity: "1",
                  fillRule: "nonzero",
                }),
              }),
              (0, n.jsx)("g", {
                clipPath: "url(#a92d5c2da4)",
                children: (0, n.jsx)("g", {
                  clipPath: "url(#b4b6473b0e)",
                  children: (0, n.jsx)("path", {
                    fill: "#ffffff",
                    d: "M 252.589844 131.664062 L 302.253906 131.664062 L 302.253906 181.324219 L 252.589844 181.324219 Z M 252.589844 131.664062 ",
                    fillOpacity: "1",
                    fillRule: "nonzero",
                  }),
                }),
              }),
              (0, n.jsx)("g", {
                clipPath: "url(#21e144dabb)",
                children: (0, n.jsx)("g", {
                  clipPath: "url(#f607a430f4)",
                  children: (0, n.jsx)("path", {
                    fill: "#ffffff",
                    d: "M 64.648438 48.894531 L 89.210938 48.894531 L 89.210938 73.457031 L 64.648438 73.457031 Z M 64.648438 48.894531 ",
                    fillOpacity: "1",
                    fillRule: "nonzero",
                  }),
                }),
              }),
              (0, n.jsx)("g", {
                clipPath: "url(#2b815840fd)",
                children: (0, n.jsx)("g", {
                  clipPath: "url(#b653580005)",
                  children: (0, n.jsx)("path", {
                    fill: "#ffffff",
                    d: "M 262.382812 275.679688 L 313.957031 275.679688 L 313.957031 327.253906 L 262.382812 327.253906 Z M 262.382812 275.679688 ",
                    fillOpacity: "1",
                    fillRule: "nonzero",
                  }),
                }),
              }),
            ],
          }),
        e2 = i(7006),
        e5 = i(6541);
      class e0 {
        constructor(e) {
          (this.isWord = e), (this.leafs = new Map());
        }
      }
      class e6 {
        insert(e) {
          if (!e) return;
          let t = this.sanitizeInputWord(e),
            i = this.root;
          for (let e = 0; e < t.length; e++)
            (i.leafs && i.leafs.has(t[e])) || i.leafs.set(t[e], new e0(!1)),
              (i = i.leafs.get(t[e]));
          i.isWord = !0;
        }
        search(e) {
          if (!e) return !1;
          let t = this.sanitizeInputWord(e),
            i = this.traverse(t);
          return null != i && i.isWord;
        }
        startsWith(e) {
          if (!e) return !1;
          let t = this.sanitizeInputWord(e);
          return null != this.traverse(t);
        }
        suggest(e, t) {
          let i = this.sanitizeInputWord(e);
          if (!e) return [];
          let s = [],
            n = this.traverse(i);
          return n && this.suggestHelperDFS(n, s, t, i), s;
        }
        sanitizeInputWord(e) {
          return this.isCaseSensitive ? e : e.toUpperCase();
        }
        traverse(e) {
          let t = this.root;
          for (let i = 0; i < e.length; i++)
            if (null == (t = t.leafs.get(e[i]))) return null;
          return t;
        }
        suggestHelperDFS(e, t, i, s) {
          let n = [{ node: e, word: s }];
          for (; n.length > 0 && t.length < i; ) {
            let { node: e, word: s } = n.shift();
            if (e.isWord && (t.push(s), t.length === i)) return;
            for (let [t, i] of e.leafs) n.push({ node: i, word: s + t });
          }
        }
        suggestHelperBFS(e, t, i, s) {
          t.length !== i &&
            (!e.isWord || (t.push(s), t.length !== i)) &&
            e.leafs &&
            0 !== e.leafs.size &&
            e.leafs.forEach((e, n, r) => this.suggestHelperBFS(e, t, i, s + n));
        }
        constructor(e) {
          (this.root = new e0(!1)),
            (this.isCaseSensitive =
              (null == e ? void 0 : e.isCaseSensitive) || !1);
        }
      }
      var e8 = (e) => {
          let { onOpen: t, onClose: i } = e,
            { data: s } = eq(),
            [a, o] = (0, r.useState)([]),
            [h, c] = (0, r.useState)(new e6());
          (0, r.useEffect)(() => {
            let e = new e6();
            for (let t = 0; t < s.tles.length; t++) {
              let i = l(s.tles[t]),
                n = C(s.satRecs[t].satnum);
              e.insert(i), e.insert(n);
            }
            o(e.suggest("a", 50).map((e) => ({ label: e }))), c(e);
          }, [s]);
          let d = (e) => {
            var t;
            if (!e) return;
            let i =
              null !== (t = s.displayNameToIndex.get(e.label)) && void 0 !== t
                ? t
                : s.noradIdToIndex.get(e.label);
            void 0 !== i &&
              window.dispatchEvent(
                new X(F, { index: i, tle: s.tles[i], satRec: s.satRecs[i] })
              );
          };
          return (0, n.jsx)(e2.Z, {
            disablePortal: !0,
            blurOnSelect: !0,
            size: "small",
            options: a,
            onInputChange: (e, t) => {
              o(h.suggest(t || "a", 50).map((e) => ({ label: e })));
            },
            onChange: (e, t) => d(t),
            onOpen: t,
            onClose: i,
            renderInput: (e) => (0, n.jsx)(e5.Z, { ...e, label: "Satellite" }),
            sx: { width: "100%", maxWidth: 250 },
          });
        },
        e4 = i(671),
        e3 = (e) => {
          let { onClick: t } = e;
          return (0, n.jsx)(eL.Z, {
            onClick: t,
            "aria-label": "menu-open",
            color: "primary",
            children: (0, n.jsx)(e4.Z, {}),
          });
        },
        e9 = (e) => {
          let { isSearchActive: t, setIsSearchActive: i } = e,
            { isPanelVisible: s, setIsPanelVisible: r } = eq(),
            a = () => {
              r(!s);
            };
          return (0, n.jsxs)(eJ.Z, {
            position: "static",
            variant: "outlined",
            elevation: 0,
            sx: {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
            children: [
              (0, n.jsxs)(en.Z, {
                container: !0,
                direction: "row",
                alignItems: "center",
                spacing: 1,
                sx: { margin: "0 0 0 10px" },
                children: [
                  (0, n.jsx)(en.Z, {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    children: (0, n.jsx)(e1, {}),
                  }),
                  (0, n.jsx)(en.Z, {
                    children: (0, n.jsx)(ex.Z, {
                      variant: "h6",
                      sx: {
                        display: { xs: "none", sm: "inline-block" },
                        margin: "0 10px 0 0",
                        color: "primary.main",
                      },
                      children: "Satellite Tracker 3D",
                    }),
                  }),
                ],
              }),
              (0, n.jsxs)(en.Z, {
                container: !0,
                direction: "row",
                alignItems: "center",
                justifyContent: "space-between",
                spacing: 1,
                flex: 1,
                margin: "0 0 0 10px",
                children: [
                  (0, n.jsx)(en.Z, {
                    flex: 1,
                    children: (0, n.jsx)(e8, {
                      onOpen: () => i(!0),
                      onClose: () => i(!1),
                    }),
                  }),
                  (0, n.jsx)(en.Z, {
                    children: (0, n.jsxs)(eh.Z, {
                      sx: { margin: "0 10px 0 0" },
                      children: [
                        !s && (0, n.jsx)(e3, { onClick: a }),
                        s &&
                          (0, n.jsx)(eL.Z, {
                            onClick: a,
                            "aria-label": "close",
                            color: "primary",
                            children: (0, n.jsx)(e$.Z, {}),
                          }),
                      ],
                    }),
                  }),
                ],
              }),
            ],
          });
        },
        e7 = i(1163);
      let te = i(1604)
          .z.string()
          .refine((e) => !isNaN(Number(e)), {
            message: "Query param must be a string containing a valid number",
          }),
        tt = !1;
      var ti = () => {
          let { data: e } = eq(),
            t = (0, e7.useRouter)(),
            i = (0, r.useRef)(null),
            s = () => {
              if (null === i.current) return;
              let t = e.noradIdToIndex.get(i.current);
              if (void 0 === t) {
                console.error(
                  "No satellite found with NORAD ID ".concat(i.current)
                );
                return;
              }
              tt ||
                ((tt = !0),
                setTimeout(() => {
                  window.dispatchEvent(
                    new X(F, { index: t, tle: e.tles[t], satRec: e.satRecs[t] })
                  );
                }, 100));
            };
          return (
            (0, r.useEffect)(() => {
              if (!t.isReady) return;
              let n = t.query["norad-id"];
              if ("string" == typeof n) {
                let e = te.safeParse(n);
                if ((console.log(e.success), !e.success)) {
                  console.error(e.error.errors);
                  return;
                }
                i.current = n;
              } else {
                let t = Math.floor(Math.random() * e.satRecs.length),
                  s = e.satRecs[t];
                if (!s) return;
                i.current = C(s.satnum);
              }
              return (
                window.addEventListener(O, s),
                () => {
                  window.removeEventListener(O, s);
                }
              );
            }, [e, t.query, t.isReady]),
            null
          );
        },
        ts = i(2729),
        tn = i(1925),
        tr = i(7527),
        ta = i(4225);
      function tl() {
        let e = (0, ts._)(["\n  && {\n    padding: 12px;\n  }\n"]);
        return (
          (tl = function () {
            return e;
          }),
          e
        );
      }
      let to = (0, tr.ZP)(eE.Z)(tl());
      var th = () => {
          let e = { latitude: 0, longitude: 0, height: 0, speedKmh: 0 },
            { isPanelVisible: t, setIsPanelVisible: i, setPanel: s } = eq(),
            { selectedSatData: h, setSelectedSatData: c } = eq(),
            [d, u] = (0, r.useState)(e);
          return (
            (0, r.useEffect)(() => {
              let t = (e) => {
                c(e.detail);
              };
              window.addEventListener(z, t);
              let i = () => {
                  if (!h) {
                    u(e);
                    return;
                  }
                  let t = (function (e) {
                    let t = new Date(),
                      i = (0, a.YX)(e.line1, e.line2),
                      s = (0, a.a0)(i, t).velocity;
                    return "boolean" == typeof s ? null : s;
                  })(h.tle);
                  if (!t) {
                    u(e);
                    return;
                  }
                  let i = (function (e) {
                      let t = new Date(),
                        i = (0, a.YX)(e.line1, e.line2),
                        s = (0, a.a0)(i, t).position;
                      if ("boolean" == typeof s)
                        return { longitude: 0, latitude: 0, height: 0 };
                      let n = (0, a.Ut)(t),
                        r = (0, a.jX)(s, n);
                      return {
                        longitude: (0, o.ZY)(r.longitude),
                        latitude: (0, o.ZY)(r.latitude),
                        height: r.height,
                      };
                    })(h.tle),
                    s = Math.sqrt(t.x * t.x + t.y * t.y + t.z * t.z);
                  u({
                    latitude: i.latitude,
                    longitude: i.longitude,
                    height: i.height,
                    speedKmh: p(s),
                  });
                },
                s = setInterval(() => {
                  i();
                }, 100);
              return () => {
                window.removeEventListener(z, t), clearInterval(s);
              };
            }, [h]),
            (0, n.jsx)(eT.Z, {
              variant: "outlined",
              sx: {
                maxWidth: "230px",
                pointerEvents: "auto",
                position: "absolute",
                bottom: "0",
                left: "0",
              },
              children: (0, n.jsxs)(to, {
                children: [
                  (0, n.jsxs)(ta.Z, {
                    alignItems: "center",
                    direction: "row",
                    gap: 1,
                    justifyContent: "space-between",
                    children: [
                      (0, n.jsx)(ex.Z, {
                        variant: "body2",
                        sx: { color: "primary.main" },
                        children: h
                          ? "".concat(l(h.tle), " #").concat(C(h.satRec.satnum))
                          : "Click or search a satellite",
                      }),
                      h &&
                        (0, n.jsx)(ed.Z, {
                          title: "More info",
                          disableTouchListener: !0,
                          children: (0, n.jsx)(eL.Z, {
                            sx: { visibility: t ? "hidden" : "visible" },
                            onClick: () => {
                              s(eY.SATELLITE), i(!0);
                            },
                            "aria-label": "open",
                            color: "primary",
                            children: (0, n.jsx)(tn.Z, {}),
                          }),
                        }),
                    ],
                  }),
                  (0, n.jsx)(ev.Z, { sx: { margin: "6px 0 8px 0" } }),
                  (0, n.jsx)(ex.Z, {
                    component: "pre",
                    variant: "body2",
                    fontFamily: "monospace",
                    children: "Speed:     ".concat(m(d.speedKmh), " km/h"),
                  }),
                  (0, n.jsx)(ex.Z, {
                    component: "pre",
                    variant: "body2",
                    fontFamily: "monospace",
                    children: "Height:    ".concat(m(d.height), " km"),
                  }),
                  (0, n.jsx)(ex.Z, {
                    component: "pre",
                    variant: "body2",
                    fontFamily: "monospace",
                    children: "Latitude:  ".concat(f(d.latitude), "\xb0"),
                  }),
                  (0, n.jsx)(ex.Z, {
                    component: "pre",
                    variant: "body2",
                    fontFamily: "monospace",
                    children: "Longitude: ".concat(f(d.longitude), "\xb0"),
                  }),
                ],
              }),
            })
          );
        },
        tc = i(1015),
        td = () => {
          let [e, t] = (0, r.useState)(!1),
            i = () => {
              setTimeout(() => t(!0), 2100);
            };
          return (
            (0, r.useEffect)(
              () => (
                window.addEventListener(O, i),
                () => {
                  window.removeEventListener(O, i);
                }
              )
            ),
            (0, n.jsx)(eh.Z, {
              sx: {
                width: "100%",
                height: "100%",
                pointerEvents: "auto",
                backgroundColor: "rgba(0,0,0,0.5)",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                display: e ? "flex" : "none",
              },
              onClick: () => t(!1),
              children: (0, n.jsx)(eT.Z, {
                variant: "outlined",
                children: (0, n.jsxs)(eE.Z, {
                  children: [
                    (0, n.jsx)(ex.Z, {
                      variant: "h6",
                      children: "Click the canvas to continue!",
                    }),
                    (0, n.jsx)(ev.Z, { sx: { margin: "6px 0 8px 0" } }),
                    (0, n.jsx)(ex.Z, {
                      variant: "body1",
                      children: "Select: Left click or touch.",
                    }),
                    (0, n.jsx)(ex.Z, {
                      variant: "body1",
                      children: "Rotate: Hold left click or drag",
                    }),
                    (0, n.jsx)(ex.Z, {
                      variant: "body1",
                      children: "Zoom: Scroll or pinch.",
                    }),
                    (0, n.jsx)(tc.Z, {
                      sx: { margin: "16px 0 0 0" },
                      variant: "contained",
                      onClick: () => t(!1),
                      children: "Got it!",
                    }),
                  ],
                }),
              }),
            })
          );
        },
        tu = i(9331),
        tC = i(6931),
        tp = i(7575),
        tx = () => {
          let [e, t] = (0, r.useState)(T.SATELLITE);
          return (0, n.jsxs)(tC.Z, {
            value: e,
            exclusive: !0,
            onChange: (e, i) => {
              let s = i === T.EARTH ? T.EARTH : T.SATELLITE;
              t(s), window.dispatchEvent(new E(A, s));
            },
            "aria-label": "Camera controls",
            children: [
              (0, n.jsx)(ed.Z, {
                title: "Earth view",
                disableTouchListener: !0,
                children: (0, n.jsx)(tp.Z, {
                  value: T.SATELLITE,
                  "aria-label": "satellite view",
                  children: (0, n.jsx)(er.Z, {}),
                }),
              }),
              (0, n.jsx)(ed.Z, {
                title: "Satellite view",
                disableTouchListener: !0,
                children: (0, n.jsx)(tp.Z, {
                  value: T.EARTH,
                  "aria-label": "earth view",
                  children: (0, n.jsx)(tu.Z, {}),
                }),
              }),
            ],
          });
        },
        tg = i(3294),
        tm = i(3479),
        tf = i(5021),
        tw = i(9106);
      let tv = [],
        tj = [];
      var ty = () => {
        let { data: e } = eq(),
          t = (0, r.useRef)(tv.length),
          i = (0, r.useRef)(tj.length);
        return (
          (0, r.useEffect)(() => {
            let e = (e) => {
              var n, r;
              let a = e.detail;
              if (a) {
                if (!s) {
                  s = a;
                  return;
                }
                (null === (n = tv[tv.length - 1]) || void 0 === n
                  ? void 0
                  : n.index) === a.index
                  ? (tv.pop(), tj.push(s), tj.length > 100 && tj.shift())
                  : (null === (r = tj[tj.length - 1]) || void 0 === r
                      ? void 0
                      : r.index) === a.index
                  ? (tj.pop(), tv.push(s), tv.length > 100 && tv.shift())
                  : (tv.push(s),
                    tv.length > 100 && tv.shift(),
                    (tj.length = 0)),
                  (t.current = tv.length),
                  (i.current = tj.length),
                  (s = a);
              }
            };
            return (
              window.addEventListener(z, e),
              () => {
                window.removeEventListener(z, e);
              }
            );
          }, [t, i]),
          (0, n.jsxs)(tw.Z, {
            "aria-label": "Satellite selection",
            children: [
              (0, n.jsx)(ed.Z, {
                title: "Random satellite",
                disableTouchListener: !0,
                children: (0, n.jsx)(eL.Z, {
                  "aria-label": "random",
                  size: "large",
                  disabled: 0 === e.satRecs.length,
                  onClick: () => {
                    let t = Math.floor(Math.random() * e.satRecs.length),
                      i = e.satRecs[t],
                      s = e.tles[t];
                    window.dispatchEvent(
                      new X(
                        F,
                        i && s ? { index: t, satRec: i, tle: s } : void 0
                      )
                    );
                  },
                  children: (0, n.jsx)(tg.Z, {}),
                }),
              }),
              (0, n.jsx)(ed.Z, {
                title: "Previous satellite",
                disableTouchListener: !0,
                children: (0, n.jsx)(eL.Z, {
                  "aria-label": "previous",
                  size: "large",
                  disabled: !t.current,
                  onClick: () => {
                    let e = tv[tv.length - 1];
                    e && window.dispatchEvent(new X(F, e));
                  },
                  children: (0, n.jsx)(tm.Z, {}),
                }),
              }),
              (0, n.jsx)(ed.Z, {
                title: "Next satellite",
                disableTouchListener: !0,
                children: (0, n.jsx)(eL.Z, {
                  "aria-label": "Next",
                  size: "large",
                  disabled: !i.current,
                  onClick: () => {
                    let e = tj[tj.length - 1];
                    e && window.dispatchEvent(new X(F, e));
                  },
                  children: (0, n.jsx)(tf.Z, {}),
                }),
              }),
            ],
          })
        );
      };
      function t_() {
        let e = (0, ts._)(["\n  && {\n    padding: 0px;\n  }\n"]);
        return (
          (t_ = function () {
            return e;
          }),
          e
        );
      }
      let tb = (0, tr.ZP)(eE.Z)(t_());
      var tZ = () =>
        (0, n.jsx)(eT.Z, {
          sx: {
            pointerEvents: "auto",
            position: "absolute",
            top: "0",
            left: "0",
          },
          children: (0, n.jsx)(tb, {
            children: (0, n.jsxs)(ta.Z, {
              alignItems: "center",
              direction: "row",
              gap: 1,
              justifyContent: "space-between",
              children: [(0, n.jsx)(tx, {}), (0, n.jsx)(ty, {})],
            }),
          }),
        });
      function tM() {
        let e = (0, ts._)(["\n  && {\n    padding: 0px;\n  }\n"]);
        return (
          (tM = function () {
            return e;
          }),
          e
        );
      }
      let tS = (0, tr.ZP)(eE.Z)(tM());
      var tP = () => {
          let {
            panel: e,
            setPanel: t,
            isPanelVisible: i,
            setIsPanelVisible: s,
          } = eq();
          return (0, n.jsx)(eT.Z, {
            sx: {
              display: e === eY.SUPPORT && i ? "none" : "flex",
              pointerEvents: "auto",
              position: "absolute",
              bottom: "0",
              right: "0",
            },
            children: (0, n.jsx)(tS, {
              children: (0, n.jsx)(eL.Z, {
                onClick: () => {
                  s(!0), t(eY.SUPPORT);
                },
                "aria-label": "open",
                color: "primary",
                size: "large",
                children: (0, n.jsx)(eo.Z, { sx: { color: eC.Z[500] } }),
              }),
            }),
          });
        },
        tL = () => {
          let {
              data: e,
              setData: t,
              isPanelVisible: i,
              setEngineContainer: s,
              setIsTransitioning: a,
            } = eq(),
            l = (0, r.useRef)(null),
            [o, h] = (0, r.useState)(!1),
            c = (0, r.useRef)(null);
          return (
            (0, r.useEffect)(() => {
              s(c ? c.current : null),
                (async () => {
                  let e = await fetch(
                    "https://satellitetracker3d.nyc3.cdn.digitaloceanspaces.com/tle-data.txt"
                  );
                  if (!e.ok) throw Error("Failed to fetch TLE data");
                  t(Z(await e.text()));
                })();
              let e = l.current,
                i = () => {
                  a(!0);
                },
                n = () => {
                  a(!1);
                };
              return (
                e &&
                  (e.addEventListener("transitionstart", i),
                  e.addEventListener("transitionend", n)),
                () => {
                  e &&
                    (e.removeEventListener("transitionstart", i),
                    e.removeEventListener("transitionend", n));
                }
              );
            }, [s]),
            (0, n.jsxs)(en.Z, {
              container: !0,
              direction: "column",
              flexWrap: "nowrap",
              sx: { width: "100vw", height: "100dvh" },
              children: [
                (0, n.jsx)(en.Z, {
                  size: 12,
                  flexShrink: "0",
                  children: (0, n.jsx)(e9, {
                    isSearchActive: o,
                    setIsSearchActive: h,
                  }),
                }),
                (0, n.jsx)(en.Z, {
                  size: 12,
                  flexGrow: "1",
                  children: (0, n.jsx)(eh.Z, {
                    sx: { width: "100%", height: "100%" },
                    children: (0, n.jsxs)(en.Z, {
                      container: !0,
                      columns: 10,
                      direction: "row",
                      sx: { height: "100%", minHeight: 0 },
                      children: [
                        (0, n.jsx)(en.Z, {
                          size: {
                            xs: i ? 0 : 10,
                            md: i ? 5 : 10,
                            lg: i ? 7 : 10,
                          },
                          sx: { transition: "all 0.5s ease" },
                          children: (0, n.jsxs)(eh.Z, {
                            sx: {
                              pointerEvents: o ? "none" : "auto",
                              width: "100%",
                              height: "100%",
                              position: "relative",
                            },
                            children: [
                              (0, n.jsx)(eA, {
                                isLoading: 0 === e.tles.length,
                              }),
                              (0, n.jsxs)(n.Fragment, {
                                children: [
                                  (0, n.jsx)("div", {
                                    ref: c,
                                    style: {
                                      position: "relative",
                                      width: "100%",
                                      height: "100%",
                                      overflow: "hidden",
                                    },
                                  }),
                                  0 !== e.tles.length && (0, n.jsx)(eQ, {}),
                                ],
                              }),
                              (0, n.jsxs)(eh.Z, {
                                sx: {
                                  pointerEvents: "none",
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  zIndex: 1,
                                },
                                children: [
                                  (0, n.jsx)(td, {}),
                                  (0, n.jsx)(eG, {}),
                                  (0, n.jsx)(tZ, {}),
                                  (0, n.jsx)(th, {}),
                                  (0, n.jsx)(ti, {}),
                                  (0, n.jsx)(tP, {}),
                                ],
                              }),
                            ],
                          }),
                        }),
                        (0, n.jsx)(en.Z, {
                          size: {
                            xs: i ? 10 : 0,
                            md: i ? 5 : 0,
                            lg: i ? 3 : 0,
                          },
                          sx: {
                            overflow: "hidden",
                            minHeight: 0,
                            position: "relative",
                            transition: "all 0.5s ease",
                          },
                          ref: l,
                          children: (0, n.jsx)(eV.Z, {
                            sx: {
                              overflow: "auto",
                              minHeight: 0,
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              zIndex: 2,
                            },
                            children: (0, n.jsx)(eX, {}),
                          }),
                        }),
                      ],
                    }),
                  }),
                }),
              ],
            })
          );
        },
        tI = () => (0, n.jsx)(tL, {});
    },
  },
  function (e) {
    e.O(0, [737, 603, 888, 774, 179], function () {
      return e((e.s = 8312));
    }),
      (_N_E = e.O());
  },
]);
