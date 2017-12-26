define(function (require, exports, module) {
    var $ = require('jquery');
    // 显示日历
    function init (n) {
        var arr = [];
        // 动态生成日历
        createRili(n);
        // 设置默认的住离时间
        setTime();
        // 将住离td标注
        addTip();
        select();
        // 获取每个日历标题相对于父元素的位置
        $('.rl-box h3').each(function () {
            arr.push($(this).position().top);
        });
        scroll(arr);
        $('.rl').css('transform', 'translate3d(0, 0, 0)');
        // 点击入离显示日历
        $('.show').on('click', function () {
            $('.rl').css('transform', 'translate3d(0, 0, 0)');
        });
        // 点击完成隐藏日历
        $('#done').on('click', function (e) {
            e.preventDefault();
            var active = $('.active');
            if (active.size() === 2) {
                $('.rl').css('transform', 'translate3d(0, 100%, 0)');
                // 更改页面中住离时间为用户选中的时间
                var sDay = addZero(parseInt(active.eq(0).text())); // 住的天
                var sMon = addZero(active.eq(0).parents('table').attr('id').slice(3));
                var eDay = addZero(parseInt(active.eq(1).text())); // 住的天
                var eMon = addZero(active.eq(1).parents('table').attr('id').slice(3));
                $('.show').find('span').eq(0).text(sMon + '-' + sDay).end().eq(1).text(eMon + '-' + eDay);
            }
        });
    };
    // 时间轴效果
    function scroll (arr) {
        console.log(arr)
        $('.rl-box').on('scroll', function () {
            var sTop = $(this).scrollTop() + 80;
            console.log(sTop)
            $.each(arr, function (i, val) {
                //console.log(sTop + ',' + val)
                if (sTop >= val && sTop < arr[i + 1]) {
                    //console.log($('.rl-box h3').eq(i))
                    if (sTop === 80) {
                        $('.rl-box h3').eq(0).css({
                            'position': 'static'
                        }); 
                    } else {
                        $('.rl-box h3').eq(i).css({
                            'position': 'absolute',
                            'top': (sTop - 80) + 'px'
                        });
                    }
                }
            });
        });
    }
    // 选择住离时间
    function select () {
        var flag = true;
        // 给td绑定事件
        $('.rl-box').on('click', 'td.normal', function () {
            // 判断是否为第一次点击
            if (flag) { // 第一次
                // 清除原有的标注，
                $('.active').find('small').remove().end().removeClass('active');
                $('.qj').removeClass('qj');
                // 当前td添加标注 
                $(this).addClass('active').append($('<small>入住</small>'));
                flag = false;
            } else { // 第二次
                var sId = $('.active').eq(0).data('id');
                var eId = $(this).data('id');
                // 判断用户是否点反了
                if (eId < sId) {
                    // 将原来入住清除
                    $('.active').find('small').remove().end().removeClass('active');
                    // 设置当前的td为入住 
                    $(this).addClass('active').append($('<small>入住</small>'));
                } else {
                    // 当前td添加标注
                    $(this).addClass('active').append($('<small>离店</small>'));
                    // 标注区间:获住与离td的自定属性data-id                    
                    $('.normal').each(function () {
                        var ID = $(this).data('id');
                        if (ID > sId && ID < eId) {
                            $(this).addClass('qj');
                        };
                    });
                    flag = true;
                }
            }
        });
    };
    // 将住离td标注
    function addTip () {
        // 根据默认住和离时间去找住离td 
        // 获取到住和离时间       
        var sTime = $('.show span').eq(0).text().split('-');
        var eTime = $('.show span').eq(1).text().split('-');
        tip(sTime, '入住');
        tip(eTime, '离店');
        // 添加区间标注
        var sId = $('.active').eq(0).data('id');
        var eId = $('.active').eq(1).data('id');
        $('.normal').each(function () {
            var ID = $(this).data('id');
            if (ID > sId && ID < eId) {
                $(this).addClass('qj');
            };
        });
    }
    // 标注
    function tip (arr, txt) {
        $('#tab' + arr[0] * 1).find('td').each(function () {
            if ($(this).text() * 1 === arr[1] * 1) {
                $(this).addClass('active').append($('<small>' + txt + '</small>'));
            }
        });
    }
    // 动态生成日历
    function createRili (sum) {
        var now = new Date(); // 系统时间
        var y = now.getFullYear();
        var m = now.getMonth();
        var date = now.getDate();
        // 按数量去循环创建日历
        var html = '';
        var c = 0;
        for (let i = 0; i < sum; i++) {
            // 容错后的日期对象
            var New = new Date(y, (m + i), 1);
            var NewTime = {
                y: New.getFullYear(), // 年
                m: New.getMonth(), // 月
                w: New.getDay()// 1号是星期几
            };
            var total = new Date(y, (m + i + 1), 0).getDate(); // 本月总天数
            // 计算行数
            var trs = Math.ceil((NewTime.w + total) / 7);
            var trNode = '';
            // 拼接行
            for (let r = 0; r < trs; r++) {
                trNode += '<tr>';
                // 添加7个td
                for (let d = 1; d <= 7; d++) {
                    var n = r * 7 + d - NewTime.w;
                    if (n < 1 || n > total) {
                        trNode += '<td> </td>';
                    } else if (NewTime.m === m && n < date) {
                        trNode += '<td class="over">' + n + '</td>';
                    } else {
                        c++;
                        trNode += '<td class="normal" data-id="' + c + '">' + n + '</td>';
                    }
                }
                trNode += '</tr>';
            }
            // 拼接日历字符串
            html += `<section>
                        <h3>${NewTime.y}年${NewTime.m + 1}月</h3>
                        <table id="tab${NewTime.m + 1}">
                            <tbody>${trNode}</tbody>
                        </table>
                    </section>`;
        };
        $('.rl-box').html(html);
    }
    // 设置默认的住离时间
    function setTime () {
        var today = new Date();
        var obj = {
            y: today.getFullYear(),
            m: today.getMonth(),
            d: today.getDate()
        };
        var countObj = count(obj.y, obj.m, obj.d + 1);
        var span = $('.show span');
        span.eq(0).text(addZero(obj.m + 1) + '-' + addZero(obj.d));// 住
        span.eq(1).text(addZero(countObj.m + 1) + '-' + addZero(countObj.d));// 离
    }
    // 容错后的日期
    function count (y, m, d) {
        var countTime = new Date(y, m, d);
        return {
            y: countTime.getFullYear(),
            m: countTime.getMonth(),
            d: countTime.getDate()
        };
    }
    // 补零
    function addZero (n) {
        return n < 10 ? '0' + n : n;
    }
    exports.init = init;
});