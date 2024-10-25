import { renderer, rendererInfo } from "./renderer.js";

export function updateDebugMenu(){
    const fpsCounter = document.getElementById('debug-ui-fps-counter');
    if (fpsCounter) {
        fpsCounter.innerText = `FPS: ${rendererInfo.fps}`;
    }

    const gpuInfoText = `
        Card: ${rendererInfo.gpuContext.card || 'Unknown'}<br>
        Manufacturer: ${rendererInfo.gpuContext.manufacturer || 'Unknown'}<br>
        Integrated: ${rendererInfo.gpuContext.integrated ? 'Yes' : 'No'}<br>
        Vendor: ${rendererInfo.gpuContext.vendor || 'Unknown'}<br>
        Renderer: ${rendererInfo.gpuContext.renderer || 'Unknown'}<br>
        Max Texture Size: ${rendererInfo.gpuContext.maxTextureSize || 'Unknown'}<br>
        Score: ${rendererInfo.gpuContext.score || 'Unknown'}<br>
        Graphical Preset: ${rendererInfo.gpuContext.graphicalPreset || 'Unknown'}<br>
        Hardware Accelerated: ${rendererInfo.gpuContext.isHardwareAccelerated ? 'Yes' : 'No'}
    `;
    const gpuInfo = document.getElementById('debug-ui-gpu-info');
    if (gpuInfo) {
        gpuInfo.innerHTML = gpuInfoText;
    }
}

document.getElementById('toggle-debug-ui').addEventListener('click', () => {
    const debugUI = document.getElementById('debug-ui');
    const toggleButton = document.getElementById('toggle-debug-ui');
    const toggleIcon = document.getElementById('debug-ui-arrow');

    const debugUIHeight = debugUI.offsetHeight;

    if (debugUI.classList.contains('debug-ui-open')) {
        debugUI.classList.remove('debug-ui-open');
        toggleIcon.classList.remove('fa-caret-up');
        toggleIcon.classList.add('fa-caret-down');
        toggleButton.classList.remove('toggle-open');
        toggleButton.style.transform = `translateY(0)`;
    } else {
        debugUI.classList.add('debug-ui-open');
        toggleIcon.classList.remove('fa-caret-down');
        toggleIcon.classList.add('fa-caret-up');
        toggleButton.classList.add('toggle-open');
        toggleButton.style.transform = `translateY(-${debugUIHeight}px)`;
    }
});