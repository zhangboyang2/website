

(function () {
    /**
     * Rect 是盘的抽象类
     */
    function Rect(index, opt) {
        this.index = index;
        this.min = 30;//盘宽
        this.step = 8;
        this.h = 20;//盘高
        this.w = this.min + this.step * this.index;
        this.div = null;
        this.from = null;
        this.tower = null;
        this.speed = opt.speed;
        this.color = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
        this.draw();
    }
    Rect.prototype = {
        draw: function () {
            var opacity = 0.3 + Math.random() * 0.7;

            // 盘---圆柱体
            var div_tank = document.createElement('div')
            div_tank.classList.add('pan');
            var div_bottom = document.createElement('div')
            var div_middle = document.createElement('div')
            var div_top = document.createElement('div')
            div_tank = $(div_tank)
            div_bottom = $(div_bottom)
            div_middle = $(div_middle)
            div_top = $(div_top)
            div_tank.css({
                position: "absolute",
                backgroundColor: this.color,
                opacity: 1,
                width: this.w + "px",
                height: this.h + 'px',
                left: "100px",
                top: 20 + this.index * 10 + "px",
                borderRadius: "2px",
                marginLeft: -(this.min + this.step * this.index - 8) / 2 + "px",
                borderBottom: "1px solid #ccc"
            })
            div_middle.css({
                width: this.w + "px",
                height: this.h + 'px',
                backgroundColor: this.color,
                position: "absolute"
            })
            div_top.css({
                width: this.w + "px",
                height: "5px",
                backgroundColor: "#ddd",
                borderRadius: "50%",
                position: "absolute",
                top: "-2px"
            })
            div_bottom.css({
                width: this.w + "px",
                height: "5px",
                backgroundColor: this.color,
                borderRadius: 60 / 25 + "px",
                position: "absolute",
                top: "6px",
                boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.75)"
            })
            div_tank.append(div_bottom)
            div_tank.append(div_middle)
            div_tank.append(div_top)

            this.div = div_tank
            $(".wrapper").append(this.div);
        },
        moveTo: function (fn) {
            var tower = this.tower;
            return tower.pushRect(this, fn);
        }
    };

    /**
     * Tower 是桩的抽象类
     */
    function Tower(index) {
        this.index = index;
        this.h = 180;//桩高
        this.w = 150;//桩底部宽
        this.top = 200;//定位
        this.left = 200;//定位
        this.div = null;
        this.origin = {
            x: this.left + this.index * this.h + this.h,
            y: this.top + this.h
        };
        this.rects = [];
        this.draw();
    }
    Tower.prototype = {
        draw: function () {
            // 桩高---圆柱体
            var div_tank = document.createElement('div')
            var div_bottom = document.createElement('div')
            var div_middle = document.createElement('div')
            var div_top = document.createElement('div')
            div_tank = $(div_tank)
            div_bottom = $(div_bottom)
            div_middle = $(div_middle)
            div_top = $(div_top)
            div_tank.css({
                position: "absolute",
                opacity: 0.8,
                left: this.origin.x + "px",
                top: this.origin.y - this.h + "px",
            })
            div_middle.css({
                width: '20px',
                height: '180px',
                backgroundColor: "#444",
                position: "absolute"
            })
            div_top.css({
                width: "20px",
                height: "5px",
                backgroundColor: "#666",
                borderRadius: "50%",
                position: "absolute",
                top: "-3px"
            })
            div_bottom.css({
                width: "20px",
                height: "50px",
                backgroundColor: "#444",
                borderRadius: 60 / 25 + "px",
                position: "absolute",
                top: "155px",
                boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.75)"
            })
            div_tank.append(div_bottom)
            div_tank.append(div_middle)
            div_tank.append(div_top)


            // 桩底部
            var div2 = document.createElement("div");
            div2 = $(div2);

            div2.css({
                position: "absolute",
                width: this.w + "px",
                height: "10px",
                backgroundColor: "#444",
                bottom: "-210px",
                left: (- this.w / 2 + 5) + 'px'
            });
            div_tank.append(div2);

            this.div = div_tank
            $(".wrapper").append(div_tank);
        },
        pushRect: function (rect, fn) {
            var canPush = false;
            if (this.rects.length === 0) {
                canPush = true;
            } else {
                var top = this.rects[this.rects.length - 1];
                if (top.index > rect.index) {
                    canPush = true;
                }
            }
            if (canPush) {
                if (rect.from) {
                    rect.from.rects = rect.from.rects.filter(function (item) {
                        return item.index !== rect.index;
                    });
                }
                this.rects.push(rect);
                rect.from = this;
                var index = this.rects.length;
                rect.div.animate({
                    top: 20 + this.origin.y - rect.h * index + "px",
                    left: 5 + this.origin.x + "px"
                }, rect.speed, fn);
            }
            return canPush;
        }
    };

    // 初始化配置
    var towercount = 3,//3个桩子
        towers = [],//存放桩子的数组
        rects = [],//存放盘的数组
        i = 0;//循环初始值

    // 初始化桩
    for (i = 0; i < towercount; i++) {
        towers.push(new Tower(i));
    }

    //执行播放函数
    function play(count, speed) {


        // 根据输入的配置初始化盘
        for (i = 0; i < count; i++) {
            rects.push(new Rect(i, {
                speed: parseInt(speed)
            }));
        }

        // 每个盘对应一个index值, index == 0 表示最高最小的那个盘, index 越大表示最低下最大的那个盘
        var index = rects.length - 1;


        // 将输入的盘配置显示在页面
        // 异步，等初始化完成后自动开始播放
        new Promise((resolve, reject) => {

            // 从最低下最大的盘开始，显示在第一个桩上面
            setAllRectsToTheFistTowerOneByOne(index, towers[0]);

            // 初始化函数
            // 将所有的盘都依次放在第一个桩上面（递归）
            function setAllRectsToTheFistTowerOneByOne(i, toTower) {
                // 如果 i<0 则初始化完成，退出函数
                if (i < 0) {
                    resolve();
                    return;
                }

                // 把盘放在第一个桩上面
                move(i, toTower, function () {
                    // 每放置一个盘就减1
                    i = i - 1;
                    // 继续放盘直到全部盘放置完成
                    setAllRectsToTheFistTowerOneByOne(i, towers[0]);
                });
            }

        }).then(() => {
            // 开始播放
            start();
        });


        /**
        * 移动盘函数
        * @param i 表示第几层的盘
        * @param toTower 表示把盘移动到哪个桩上面
        * @param fn 方法函数
        */
        function move(i, toTower, fn) {
            rects[i].tower = toTower;
            rects[i].moveTo(fn)
        }

        // 播放函数, 将第1个桩子所有的盘都移动到第3个桩子上面
        function start() {
            var steps = [];//每个盘移动的步骤

            hanoi(count - 1, towers[0], towers[1], towers[2], function (prop) {
                // 保存每个盘移动的步骤，核心算法
                steps.push(prop);
            });


            var i = 0,
                len = steps.length;

            console.log(steps);

            loop(i);

            function loop(i) {
                // i >= len 做完步骤退出
                if (i >= len) {
                    return;
                }
                // 根据步骤移动盘
                move(steps[i].index, steps[i].toTower, function () {
                    i = i + 1;
                    loop(i);
                });
            }
        }


        /**
         * hanoi  函数是汉诺塔递归的核心算法
         * 它表示将第一个桩子所有的盘都移动到第三个桩子上面
         * @param num  第几个盘的索引
         * @param one  第1根桩子
         * @param two  第2根桩子
         * @param three  第3根桩子
         * @param fn  回调函数
         */
        function hanoi(num, one, two, three, fn) {
            if (num === 0) {
                fn({
                    index: num,//第几个盘的索引
                    toTower: three//需要移动到哪个桩上面
                });
            } else {
                hanoi(num - 1, one, three, two, fn);
                fn({
                    index: num,
                    toTower: three
                });
                hanoi(num - 1, two, one, three, fn);
            }
        }


    }



    var speed = 0;//速度
    var count = 0;//盘数/层数

    // 记录是否已经开始播放
    var flag = false;
    var stop = false;

    // 点击按钮播放
    $('#start').on("click", function () {
        console.log('start', flag);

        // 如果还在播放就退出方法
        if (flag) {
            // 是否点暂停
            if (stop) {
                // 重新开始
                $('#restart').click()
            }
            return false;
        }

        // 开始播放
        flag = true;
        // 获取输入框的信息
        speed = $("#speed").val();
        count = $("#count").val();
        // 执行方法
        play(count, speed);

    });


    // 重新开始
    $('#restart').on("click", function () {
        console.log('restart');
        // 停止当前动画
        $('.pan').stop()

        $('.wrapper').remove();
        var div = document.createElement('div');
        div.classList.add('wrapper');
        $('body').append(div);

        // 初始化配置
        towercount = 3,//3个桩子
            towers = [],//存放桩子的数组
            rects = [],//存放盘的数组
            i = 0;//循环初始值
        // 初始化桩
        for (i = 0; i < towercount; i++) {
            towers.push(new Tower(i));
        }

        // 开始播放
        flag = true;
        // 获取输入框的信息
        speed = $("#speed").val();
        count = $("#count").val();
        // 执行方法
        play(count, speed);

    });

    // 点击停止
    $('#stop').on("click", function () {
        console.log('stop');
        // 停止当前动画
        $('.pan').stop();
        stop = true;
    });

})();