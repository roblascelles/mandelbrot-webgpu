(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`// vertex_shader.wgsl
struct Uniforms {
    centre: vec2<f32>,
    zoom: f32,
    aspect_ratio: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPos: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    //triangle bigger than the screen:
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0), // Bottom Left
        vec2<f32>( 3.0, -1.0), // Far Right (outside screen)
        vec2<f32>(-1.0,  3.0)  // Far Top (outside screen)
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.worldPos = pos[vertexIndex];
    return output;
}

// Convert HSV to RGB for colorful visualization
fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3<f32> {
    let c = v * s;
    let x = c * (1.0 - abs((h * 6.0) % 2.0 - 1.0));
    let m = v - c;
    
    var rgb: vec3<f32>;
    if (h < 0.166667) {
        rgb = vec3<f32>(c, x, 0.0);
    } else if (h < 0.333333) {
        rgb = vec3<f32>(x, c, 0.0);
    } else if (h < 0.5) {
        rgb = vec3<f32>(0.0, c, x);
    } else if (h < 0.666667) {
        rgb = vec3<f32>(0.0, x, c);
    } else if (h < 0.833333) {
        rgb = vec3<f32>(x, 0.0, c);
    } else {
        rgb = vec3<f32>(c, 0.0, x);
    }
    
    return rgb + vec3<f32>(m, m, m);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    // Transform screen coordinates to complex plane using uniforms
    let c = uniforms.centre + (in.worldPos * vec2<f32>(uniforms.aspect_ratio, 1.0)) / uniforms.zoom; 
    var z = vec2<f32>(0.0, 0.0);
    var iter: i32 = 0;
    let max_iter: i32 = 256;

    for (var i = 0; i < max_iter; i++) {
        z = vec2<f32>(
            z.x * z.x - z.y * z.y + c.x,
            2.0 * z.x * z.y + c.y
        );

        if (dot(z, z) > 4.0) { 
            iter = i;
            break; 
        }
    }

    // Points in the set are black
    if (iter == 0 || iter >= max_iter - 1) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Smooth coloring for points outside the set
    let zn = length(z);
    let smooth_iter = f32(iter) + 1.0 - log2(log2(zn));
    
    // Map to hue with saturation and value
    let hue = (smooth_iter / 50.0) % 1.0;
    let saturation = 0.8;
    let value = 0.9;
    
    let rgb = hsv2rgb(hue, saturation, value);
    return vec4<f32>(rgb, 1.0);
}`;async function t(){if(!navigator.gpu){alert(`WebGPU is not supported in this browser.`);return}let t=await(await navigator.gpu.requestAdapter()).requestDevice(),n=document.getElementById(`gpuCanvas`),r=n.getContext(`webgpu`),i=navigator.gpu.getPreferredCanvasFormat();function a(){n.width=window.innerWidth,n.height=window.innerHeight}a(),r.configure({device:t,format:i,alphaMode:`premultiplied`});let o=t.createShaderModule({code:e}),s=t.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),c={x:-.5,y:0},l=1,u=n.width/n.height,d=t.createRenderPipeline({layout:`auto`,vertex:{module:o,entryPoint:`vs_main`},fragment:{module:o,entryPoint:`fs_main`,targets:[{format:i}]},primitive:{topology:`triangle-list`}}),f=t.createBindGroup({layout:d.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:s}}]});function p(){let e=new Float32Array([c.x,c.y,l,u]);t.queue.writeBuffer(s,0,e);let n=t.createCommandEncoder(),i={colorAttachments:[{view:r.getCurrentTexture().createView(),clearValue:{r:.1,g:.1,b:.1,a:1},loadOp:`clear`,storeOp:`store`}]},a=n.beginRenderPass(i);a.setPipeline(d),a.setBindGroup(0,f),a.draw(3),a.end(),t.queue.submit([n.finish()])}let m=!1,h={x:0,y:0};n.addEventListener(`mousedown`,e=>{m=!0,h={x:e.clientX,y:e.clientY}}),n.addEventListener(`mouseup`,()=>{m=!1}),n.addEventListener(`mouseleave`,()=>{m=!1}),n.addEventListener(`mousemove`,e=>{if(!m)return;let t=e.clientX-h.x,r=e.clientY-h.y,i=2/l;c.x-=t/n.width*i*u,c.y+=r/n.height*i,h={x:e.clientX,y:e.clientY},p()}),n.addEventListener(`wheel`,e=>{e.preventDefault();let t=n.getBoundingClientRect(),r=(e.clientX-t.left)/n.width*2-1,i=-((e.clientY-t.top)/n.height*2-1),a=c.x+r*u/l,o=c.y+i/l,s=e.deltaY>0?.9:1.1;l*=s,c.x=a-r*u/l,c.y=o-i/l,p()}),window.addEventListener(`resize`,()=>{a(),u=n.width/n.height,p()}),p()}t();