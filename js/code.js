"use strict";

import * as cg from "./cg.js";
import * as m4 from "./glmjs/mat4.js";
import * as twgl from "./twgl-full.module.js";
import * as v3 from "./glmjs/vec3.js";
import * as v4 from "./glmjs/vec4.js";

function nueva_region() {
  let terreno = new Array(40);
  const rndb = (a, b) => Math.random() * (b - a) + a;
  for (let i = -20; i < 20; i++) {
    terreno[i] = new Array(40);
    for (let j = -20; j < 20; j++) {
      let sup = rndb(0, 2);
      terreno[i][j] = [i, -sup / 3, j, Math.floor(sup)];
    }
  }
  return terreno;
}

function incrementar_region(Actual) {
  let terrenoNuevo = new Array(Actual.length + 2);
  const rndb = (a, b) => Math.random() * (b - a) + a;
  for (let i = -terrenoNuevo.length / 2; i < terrenoNuevo.length / 2; i++) {
    terrenoNuevo[i] = new Array(terrenoNuevo.length);

    for (let j = -terrenoNuevo.length / 2; j < terrenoNuevo.length / 2; j++) {
      if (i == -terrenoNuevo.length / 2 || i == terrenoNuevo.length / 2 - 1 || j == -terrenoNuevo.length / 2 || j == +terrenoNuevo.length / 2 - 1) {
        let sup = rndb(0, 2);
        terrenoNuevo[i][j] = [i, -sup / 3, j, Math.floor(sup)];
      } else {
        terrenoNuevo[i][j] = Actual[i][j];
      }
    }
  }
  return terrenoNuevo;
}

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("WebGL 2.0 not supported");

  twgl.setDefaults({ attribPrefix: "a_" });

  const numInstances = 5000;
  const transforms = new Float32Array(numInstances * 16);
  const infoInstances = new Array(numInstances);
  for (let i = 0; i < numInstances; i++) {
    infoInstances[i] = {
      transform: transforms.subarray(i * 16, i * 16 + 16),
    };
    m4.identity(infoInstances[i].transform);
    m4.rotate(infoInstances[i].transform, infoInstances[i].transform, Math.random() * 2 * Math.PI, [Math.random(), Math.random(), Math.random()]);
    m4.translate(infoInstances[i].transform, infoInstances[i].transform, [0, 40, 0]);
    const scale = Math.random() * 0.05 + 0.02;
    m4.scale(infoInstances[i].transform, infoInstances[i].transform, [scale, scale, scale]);
  }

  const vert = await fetch("glsl/vertexIns.vert").then((r) => r.text());
  const frag = await fetch("glsl/fragmentIns.frag").then((r) => r.text());
  const insProgramInfo = twgl.createProgramInfo(gl, [vert, frag]);
  const instancias = await cg.loadObj("models/star/planet.obj", gl, insProgramInfo, transforms);

  const vertSrc = await fetch("glsl/vertexSrc.vert").then((r) => r.text());
  const fragSrc = await fetch("glsl/fragmentSrc.frag").then((r) => r.text());
  const meshProgramInfo = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
  const piso1 = await cg.loadObj("models/nieve/cubito.obj", gl, meshProgramInfo);
  const piso2 = await cg.loadObj("models/pasto/cubito.obj", gl, meshProgramInfo);

  const vertSrcLS = await fetch("glsl/ls.vert").then((r) => r.text());
  const fragSrcLS = await fetch("glsl/ls.frag").then((r) => r.text());
  const lsProgramInfo = twgl.createProgramInfo(gl, [vertSrcLS, fragSrcLS]);
  const lightSource = await cg.loadObj("models/star/planet.obj", gl, lsProgramInfo); //Luna Giratoria
  const lightSource2 = await cg.loadObj("models/pasto/cubito.obj", gl, lsProgramInfo);

  const vertA = await fetch("glsl/vertexA.vert").then((r) => r.text());
  const fragA = await fetch("glsl/fragmentA.frag").then((r) => r.text());
  const AProgramInfo = twgl.createProgramInfo(gl, [vertA, fragA]);
  const piso1A = await cg.loadObj("models/nieve/cubito.obj", gl, AProgramInfo);
  const piso2A = await cg.loadObj("models/pasto/cubito.obj", gl, AProgramInfo);

  const vertB = await fetch("glsl/vertexB.vert").then((r) => r.text());
  const fragB = await fetch("glsl/fragmentB.frag").then((r) => r.text());
  const BProgramInfo = twgl.createProgramInfo(gl, [vertB, fragB]);
  const piso1B = await cg.loadObj("models/nieve/cubito.obj", gl, BProgramInfo);
  const piso2B = await cg.loadObj("models/pasto/cubito.obj", gl, BProgramInfo);

  const vertLanternSrc = await fetch("glsl/lanternVertexSrc.vert").then((r) => r.text());
  const fragLanternSrc = await fetch("glsl/lanternFragSrc.frag").then((r) => r.text());
  const lanternProgramInfo = twgl.createProgramInfo(gl, [vertLanternSrc, fragLanternSrc]);
  const LanternInstances = await cg.loadObj("models/star/planet.obj", gl, lanternProgramInfo, transforms);

  const vertC = await fetch("glsl/lanternVertexSrc.vert").then((r) => r.text());
  const fragC = await fetch("glsl/lanternFragSrc.frag").then((r) => r.text());
  const CProgramInfo = twgl.createProgramInfo(gl, [vertC, fragC]);
  const piso1C = await cg.loadObj("models/nieve/cubito.obj", gl, CProgramInfo);
  const piso2C = await cg.loadObj("models/pasto/cubito.obj", gl, CProgramInfo);

  const cam = new cg.Cam([0, 5, 30], 25);
  const lightRotAxis = new Float32Array([0.0, 0.0, 0.0]);
  const lightRotSource = new Float32Array([15.0, 12.0, 5.0]);
  const rotationAxis = new Float32Array([0.0, 1.0, 0.0]);
  const lsPosition = new Float32Array([0.0, 10.0, 0.0]);
  const lsVision = new Float32Array([0.0, -0.5, 0.0]);
  let girarInstancias = true;
  let aspect = 16.0 / 9.0;
  let deltaTime = 0;
  let lastTime = 0;
  let theta = 0;
  const lsScale = new Float32Array([0.075, 0.07, 0.07]);
  const cubeScale = new Float32Array([0.5, 0.5, 0.5]);
  let terreno = nueva_region();

  const uniforms = {
    u_world: m4.create(),
    u_projection: m4.create(),
    u_view: cam.viewM4,
  };
  const AfragUniforms = {
    u_lightColor: new Float32Array([1.0, 1.0, 1.0]),
    u_ambientStrength: new Float32Array([1.5, 1.5, 1.5]),
  };
  const BfragUniforms = {
    u_lightDir: new Float32Array([1.0, 1.0, 1.0]),
    u_lightColor: new Float32Array([1.0, 1.0, 1.0]),
  };
  const lsfragUniforms = {
    u_lightColor: new Float32Array([1.0, 1.0, 1.0]),
    u_lightPosition: new Float32Array([0.0, 0.0, 0.0]),
    u_viewPosition: cam.pos,
    u_diffuseColor: new Float32Array([1.0, 1.0, 1.0]),
  };
  const fragUniforms = {
    u_ambientStrength: new Float32Array([1.0, 1.0, 1.0]),
    u_lightColorAmbient: new Float32Array([1.0, 1.0, 1.0]),
    u_diffuseVec: new Float32Array([0.0, 0.0, 0.0]),
    u_lightColorDiffuse: new Float32Array([1.0, 1.0, 1.0]),
    u_viewPosition: cam.pos,
    "u_light.cutOff": Math.cos(Math.PI / 30.0),
    "u_light.direction": cam.lookAt,
    "u_light.position": cam.pos,
    u_lightColorLantern: new Float32Array([1.0, 1.0, 1.0]),
    "u_light.outerCutOff": Math.cos(Math.PI / 24),
    "u_light.constant": 1.0,
    "u_light.linear": 0.09,
    "u_light.quadratic": 0.032,
  };
  const lsFragColor = {
    u_lightColor: new Float32Array([1.0, 1.0, 1.0]),
  };
  const lanFragUniforms = {
    u_viewPosition: cam.pos,
    "u_light.cutOff": Math.cos(Math.PI / 6.0),
    "u_light.direction": lsVision,
    "u_light.position": lsPosition,
    u_lightColorLantern: lsFragColor.u_lightColor,
    "u_light.outerCutOff": Math.cos(Math.PI / 3),
    "u_light.constant": 1.0,
    "u_light.linear": 0.09,
    "u_light.quadratic": 0.032,
  };
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  function render(elapsedTime) {
    elapsedTime *= 1e-3;
    deltaTime = elapsedTime - lastTime;
    lastTime = elapsedTime;

    if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      aspect = gl.canvas.width / gl.canvas.height;
    }

    gl.clearColor(0.1, 0.1, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (girarInstancias) {
      theta = (elapsedTime * Math.PI) / 16.0;
    }

    m4.identity(uniforms.u_projection);
    m4.perspective(uniforms.u_projection, cam.zoom, aspect, 0.1, 100);

    if (document.getElementById("state1").checked) {
      gl.useProgram(AProgramInfo.program);
      m4.identity(uniforms.u_world);
      for (let i = -terreno.length / 2; i < terreno.length / 2; i++) {
        for (let j = -terreno.length / 2; j < terreno.length / 2; j++) {
          m4.identity(uniforms.u_world);
          m4.translate(uniforms.u_world, uniforms.u_world, [terreno[i][j][0], terreno[i][j][1], terreno[i][j][2]]);
          m4.scale(uniforms.u_world, uniforms.u_world, cubeScale);
          twgl.setUniforms(AProgramInfo, uniforms);
          twgl.setUniforms(AProgramInfo, AfragUniforms);
          if (terreno[i][j][3] == 1) {
            for (const { bufferInfo, vao, material } of piso2A) {
              gl.bindVertexArray(vao);
              twgl.setUniforms(AProgramInfo, {}, material);
              twgl.drawBufferInfo(gl, bufferInfo);
            }
          } else {
            for (const { bufferInfo, vao, material } of piso1A) {
              gl.bindVertexArray(vao);
              twgl.setUniforms(AProgramInfo, {}, material);
              twgl.drawBufferInfo(gl, bufferInfo);
            }
          }
        }
      }
    }
    if (document.getElementById("state2").checked) {
      gl.useProgram(BProgramInfo.program);
      m4.identity(uniforms.u_world);
      for (let i = -terreno.length / 2; i < terreno.length / 2; i++) {
        for (let j = -terreno.length / 2; j < terreno.length / 2; j++) {
          m4.identity(uniforms.u_world);
          m4.translate(uniforms.u_world, uniforms.u_world, [terreno[i][j][0], terreno[i][j][1], terreno[i][j][2]]);
          m4.scale(uniforms.u_world, uniforms.u_world, cubeScale);
          twgl.setUniforms(BProgramInfo, uniforms);
          twgl.setUniforms(BProgramInfo, BfragUniforms);
          if (terreno[i][j][3] == 1) {
            for (const { bufferInfo, vao, material } of piso2B) {
              gl.bindVertexArray(vao);
              twgl.setUniforms(AProgramInfo, {}, material);
              twgl.drawBufferInfo(gl, bufferInfo);
            }
          } else {
            for (const { bufferInfo, vao, material } of piso1B) {
              gl.bindVertexArray(vao);
              twgl.setUniforms(BProgramInfo, {}, material);
              twgl.drawBufferInfo(gl, bufferInfo);
            }
          }
        }
      }
    }
    if (document.getElementById("state3").checked) {
      gl.useProgram(lsProgramInfo.program);
      m4.identity(uniforms.u_world);
      m4.translate(uniforms.u_world, uniforms.u_world, lsfragUniforms.u_lightPosition);
      m4.scale(uniforms.u_world, uniforms.u_world, lsScale);
      twgl.setUniforms(lsProgramInfo, uniforms);
      twgl.setUniforms(lsProgramInfo, lsfragUniforms);
      for (const { bufferInfo, vao, material } of lightSource) {
        gl.bindVertexArray(vao);
        twgl.setUniforms(lsProgramInfo, {}, material);
        twgl.drawBufferInfo(gl, bufferInfo);
      }
      v3.rotateY(lsfragUniforms.u_lightPosition, lightRotSource, lightRotAxis, theta);

      gl.useProgram(meshProgramInfo.program);
      m4.identity(uniforms.u_world);
      for (let i = -terreno.length / 2; i < terreno.length / 2; i++) {
        for (let j = -terreno.length / 2; j < terreno.length / 2; j++) {
          m4.identity(uniforms.u_world);
          m4.translate(uniforms.u_world, uniforms.u_world, [terreno[i][j][0], terreno[i][j][1], terreno[i][j][2]]);
          m4.scale(uniforms.u_world, uniforms.u_world, cubeScale);
          twgl.setUniforms(meshProgramInfo, uniforms);
          twgl.setUniforms(meshProgramInfo, lsfragUniforms);
          if (terreno[i][j][3] == 1) {
            for (const { bufferInfo, vao, material } of piso2) {
              gl.bindVertexArray(vao);
              twgl.setUniforms(meshProgramInfo, {}, material);
              twgl.drawBufferInfo(gl, bufferInfo);
            }
          } else {
            for (const { bufferInfo, vao, material } of piso1) {
              gl.bindVertexArray(vao);
              twgl.setUniforms(meshProgramInfo, {}, material);
              twgl.drawBufferInfo(gl, bufferInfo);
            }
          }
        }
      }
    }
    if (document.getElementById("state4").checked) {
      gl.useProgram(lanternProgramInfo.program);
      m4.identity(uniforms.u_world);
      m4.rotate(uniforms.u_world, uniforms.u_world, -theta, rotationAxis);
      twgl.setUniforms(lanternProgramInfo, uniforms);
      twgl.setUniforms(lanternProgramInfo, fragUniforms);
      for (const { bufferInfo, vertexArrayInfo, vao, material } of LanternInstances) {
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_transform.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, transforms);
        twgl.setUniforms(lanternProgramInfo, {}, material);
        twgl.drawBufferInfo(gl, vertexArrayInfo, gl.TRIANGLES, vertexArrayInfo.numElements, 0, numInstances);
      }
    }
    if (document.getElementById("state5").checked) {
      gl.useProgram(lsProgramInfo.program);
      m4.identity(uniforms.u_world);
      m4.translate(uniforms.u_world, uniforms.u_world, lsPosition);
      m4.scale(uniforms.u_world, uniforms.u_world, lsScale);
      twgl.setUniforms(lsProgramInfo, uniforms);
      twgl.setUniforms(lsProgramInfo, lsFragColor);
      for (const { bufferInfo, vao, material } of lightSource2) {
        gl.bindVertexArray(vao);
        twgl.setUniforms(lsProgramInfo, {}, material);
        twgl.drawBufferInfo(gl, bufferInfo);
      }

      gl.useProgram(CProgramInfo.program);
      m4.identity(uniforms.u_world);
      for (let i = -terreno.length / 2; i < terreno.length / 2; i++) {
        for (let j = -terreno.length / 2; j < terreno.length / 2; j++) {
          m4.identity(uniforms.u_world);
          m4.translate(uniforms.u_world, uniforms.u_world, [terreno[i][j][0], terreno[i][j][1], terreno[i][j][2]]);
          m4.scale(uniforms.u_world, uniforms.u_world, cubeScale);
          twgl.setUniforms(CProgramInfo, uniforms);
          twgl.setUniforms(CProgramInfo, lanFragUniforms);
          if (terreno[i][j][3] == 1) {
            for (const { bufferInfo, vao, material } of piso2C) {
              gl.bindVertexArray(vao);
              twgl.setUniforms(CProgramInfo, {}, material);
              twgl.drawBufferInfo(gl, bufferInfo);
            }
          } else {
            for (const { bufferInfo, vao, material } of piso1C) {
              gl.bindVertexArray(vao);
              twgl.setUniforms(CProgramInfo, {}, material);
              twgl.drawBufferInfo(gl, bufferInfo);
            }
          }
        }
      }
    }

    gl.useProgram(insProgramInfo.program);
    m4.identity(uniforms.u_world);
    m4.rotate(uniforms.u_world, uniforms.u_world, -theta, rotationAxis);
    twgl.setUniforms(insProgramInfo, uniforms);
    twgl.setUniforms(insProgramInfo, lsfragUniforms);
    for (const { bufferInfo, vertexArrayInfo, vao, material } of instancias) {
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_transform.buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, transforms);
      twgl.setUniforms(insProgramInfo, {}, material);
      twgl.drawBufferInfo(gl, vertexArrayInfo, gl.TRIANGLES, vertexArrayInfo.numElements, 0, numInstances);
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  document.addEventListener("keydown", (e) => {
    /**/ if (e.key === "w") {
      cam.processKeyboard(cg.FORWARD, deltaTime);
    } else if (e.key === "a") {
      cam.processKeyboard(cg.LEFT, deltaTime);
    } else if (e.key === "s") {
      cam.processKeyboard(cg.BACKWARD, deltaTime);
    } else if (e.key === "d") {
      cam.processKeyboard(cg.RIGHT, deltaTime);
    } else if (e.key === "i") {
      terreno = incrementar_region(terreno);
    } else if (e.key === "r") {
      girarInstancias = !girarInstancias;
    }
  });
  document.addEventListener("mousemove", (e) => cam.movePov(e.x, e.y));
  document.addEventListener("mousedown", (e) => cam.startMove(e.x, e.y));
  document.addEventListener("mouseup", () => cam.stopMove());
  document.addEventListener("wheel", (e) => cam.processScroll(e.deltaY));
}

main();
