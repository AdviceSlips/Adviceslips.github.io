window.addEventListener('load', load);
document.addEventListener("touchstart", e => swipe(e));
document.addEventListener("mousedown", e => swipe(e));
document.addEventListener("touchmove", e => swipe(e));
document.addEventListener("mousemove", e => swipe(e));
document.addEventListener("touchend", e => swipe(e));
document.addEventListener("mouseup", e => swipe(e));

function swipe(e) {
    let type = e.type;

    if (type === 'touchstart' || type === 'mousedown') {
        window.localStorage.setItem('isTouched', 'true');
        window.localStorage.setItem('clientStartX', e.touches ? e.touches[0].clientX : e.clientX);
        setSwiperCursor((e.touches ? e.touches[0].clientX : e.clientX), (e.touches ? e.touches[0].clientY : e.clientY));
        $('body').css('cursor', 'none');
    }
    if (type === 'touchend' || type === 'mouseup') {
        window.localStorage.setItem('isTouched', 'false');
        let rightSwap = window.localStorage.getItem('rightSwipe') === 'true';
        let leftSwap = window.localStorage.getItem('leftSwipe') === 'true';
        if (rightSwap || leftSwap) {
            addFlashAnimation(rightSwap, leftSwap)
            window.localStorage.setItem('rightSwipe', 'false');
            window.localStorage.setItem('leftSwipe', 'false');
        }
        $('.dot').css('background', 'rgba(0, 0, 0,.7)');
        $('.dot').css('box-shadow', '0 0 4px 8px rgba(0,0,0,.2),0 0 4px 10px rgba(0,0,0,.2),0 0 1px 2px rgba(0,0,0,1)');
        $('body').css('cursor', 'pointer');
        setSwiperCursor(-100, -100);
    }

    let isTouched = window.localStorage.getItem('isTouched') === 'true';
    if (isTouched && (type === 'touchmove' || type === 'mousemove')) {
        setSwiperCursor((e.touches ? e.touches[0].clientX : e.clientX), (e.touches ? e.touches[0].clientY : e.clientY));
        let clientStartX = window.localStorage.getItem('clientStartX');
        let clientX = (e.touches ? e.touches[0].clientX : e.clientX) - parseInt(clientStartX);
        if (Math.abs(clientX) > ($(document).width() * 0.15)) {
            if(clientX>0) {
                window.localStorage.setItem('rightSwipe', 'true');
            } else {
                window.localStorage.setItem('leftSwipe', 'true');
            }
            $('.dot').css('background', 'rgba(194, 255, 28,.6)');
            $('.dot').css('box-shadow', '0 0 4px 8px rgba(194, 255, 28,.2),0 0 4px 10px rgba(194, 255, 28,.2),0 0 1px 2px rgba(70, 70, 70,1)');
        } else {
            window.localStorage.setItem('leftSwipe', 'false');
            window.localStorage.setItem('rightSwipe', 'false');
            $('.dot').css('background', 'rgba(0, 0, 0,.7)');
            $('.dot').css('box-shadow', '0 0 4px 8px rgba(0,0,0,.2),0 0 4px 10px rgba(0,0,0,.2),0 0 1px 2px rgba(0,0,0,1)');
        }
    }
}

function setSwiperCursor(left, top) {
    $('.dot-start').css('left', left);
    $('.dot-start').css('top', top);
}

function load() {
    let id = new URL(window.location.href).searchParams.get('id');
    if(id){
        window.localStorage.setItem('viaLink', true);
    }
    $('#heart').html(deviceType() === 'desktop' ? '💗' : '❤');
    loadRandomAdvice();
}

function loadRandomAdvice() {
    let id = new URL(window.location.href).searchParams.get('id');
    let url = 'https://api.adviceslip.com/advice';
    if(id){
        window.localStorage.setItem('viaLink', true);
        url+= `/${id}`
    } else {
        window.localStorage.setItem('viaLink', false);
    }
    $.get(url)
        .done(function (data) {
            let slip = JSON.parse(data).slip;
            window.localStorage.setItem('slip', JSON.stringify(slip));
            setTimeout(() => {
                fillSlipData(slip)
            }, 500)
        })
}

function fillSlipData(slip) {
    $('#advice-title').html(`Advice <small class="id">#</small> ${slip.id}`);
    $('#advice').html(`${slip.advice}`);
    $('#advice-author').html(`${firstNames[random(20)]}  ${lastNames[random(6)]} &copy;`);
    $('#heart').toggleClass('spin');
}

const firstNames = [
    'Liam', 'Olivia',
    'Noah', 'Emma',
    'Oliver', 'Charlotte',
    'Elijah', 'Amelia',
    'James', 'Ava',
    'William', 'Sophia',
    'Benjamin', 'Isabella',
    'Lucas', 'Mia',
    'Henry', 'Evelyn',
    'Theodore', 'Harper',
];
const lastNames = ['Turner', 'Smith', 'Carry', 'Asus', 'Kim', 'Kernel'];

function random(max) {
    return Math.floor(Math.random() * max);
}

let timer = undefined;

function addFlashAnimation(rightSwipe, leftSwipe) {
    if(window.localStorage.getItem('viaLink') === 'true'){
        window.history.pushState("", "Title", "/");
        window.localStorage.setItem('viaLink',false);
    }
    if (timer) {
        timer = undefined;
    }
    $('#advice').html('<span class="skeleton mb-1">--------------------------------------</span><br>'
        + '    <span class="skeleton mb-1">------------------------</span><br>'
        + '<span class="skeleton mb-1">--------------------------------</span><br>'
        + '    <span class="skeleton mb-1">----------------------</span><br>'
        + '    <span class="skeleton mb-1">---------------------------------</span><br>');
    $('#advice-title').html('<span class="skeleton mb-1">------------------</span>');
    $('#advice-author').html('<span class="skeleton mb-1">------------------</span>')

    if(rightSwipe){
        $('#randomize').toggleClass("flashR");
    }
    else if(leftSwipe){
        $('#randomize').toggleClass("flashL");
    }
    $('#heartParent').toggleClass("spin");
    $('#share').toggleClass("opacity-0");
    loadRandomAdvice();
    timer = setTimeout(() => {
        if(rightSwipe){
            $('#randomize').toggleClass("flashR");
        }
        else if(leftSwipe){
            $('#randomize').toggleClass("flashL");
        }
        $('#heartParent').toggleClass("spin");
        $('#share').toggleClass("opacity-0");
    }, 1000)
}

function share(){
    let slip = JSON.parse(window.localStorage.getItem('slip'));
    // takeScreenshot()
    if (navigator.canShare) {
        navigator.share({
            title: 'Advice #'+slip.id,
            url: window.location.href.includes('?id=')
                ? window.location.href
                : window.location.href.substring(0,window.location.href.length-1) +'?id='+slip.id,
            text: 'Advice #'+slip.id+'\n"'+slip.advice+'"\n',
        });
    }
}

function takeScreenshot() {

    let footer = $('.footer');

    html2canvas(document.body).then((canvas) => {
        const base64image = canvas.toDataURL("image/png");

        let w = window.open('', '_blank')
        let img = document.createElement('image');
        img.css('background', 'url('+base64image+')');
        img.css('width',canvas.width);
        img.css('height',canvas.height);
        w.body.html(img)

    });
    $('#randomize').append(footer);
}


const deviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
    }
    return "desktop";
};
