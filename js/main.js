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
        if (rightSwap) {
            addFlashAnimation()
            window.localStorage.setItem('rightSwipe', 'false');
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
        if (clientX > ($(document).width() * 0.15)) {
            $('.swipe-indicator').toggleClass('swipe-active');
            window.localStorage.setItem('rightSwipe', 'true');
            $('.dot').css('background', 'rgba(194, 255, 28,.6)');
            $('.dot').css('box-shadow', '0 0 4px 8px rgba(194, 255, 28,.2),0 0 4px 10px rgba(194, 255, 28,.2),0 0 1px 2px rgba(70, 70, 70,1)');
        }
        if (clientX < ($(document).width() * 0.25)) {
            $('.swipe-indicator').toggleClass('swipe-active');
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
    $('#heart').html(deviceType() === 'desktop' ? '💗' : '❤');
    loadRandomAdvice();
}

function loadRandomAdvice() {
    let id = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);
    console.log(id)
    let url = 'https://api.adviceslip.com/advice'+(`${id !== '' ? '/'+id : ''}`);
    $.get(url)
        .done(function (data) {
            let slip = JSON.parse(data).slip;
            window.localStorage.setItem('slip', JSON.stringify(slip));
            setTimeout(() => {
                fillSlipData(slip)
            }, 500)
        })
    if(id !== ''){
        history.pushState({}, null, '');
    }
}

function fillSlipData(slip) {
    $('#share').attr('data-slipid',slip.id);

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

function addFlashAnimation() {
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

    $('#randomize').toggleClass("flash");
    $('#heartParent').toggleClass("spin");
    loadRandomAdvice();
    timer = setTimeout(() => {
        $('#randomize').toggleClass("flash");
        $('#heartParent').toggleClass("spin");
    }, 1000)
}

function share(){
    let slip = JSON.parse(window.localStorage.getItem('slip'));
    if (navigator.canShare) {
        navigator.share({
            title: 'Advice #'+slip.id,
            text: slip.advice,
            url: window.location.href+'/'+slip.id,
        });
    }
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
