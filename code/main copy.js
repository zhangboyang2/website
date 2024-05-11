

(function () {


    /**
     * Rect 是盘的抽象类
     */
    function Rect(index, opt) {
        this.index = index;
        this.min = 20;
        this.step = 8;
        this.h = 10;
        this.w = this.min + this.step * this.index;
        this.div = null;
        this.from = null;
        this.tower = null;
        this.speed = opt.speed;
        this.draw();
    }

    Rect.prototype = {
        draw: function () {
            this.div = $(document.createElement("div"));
            //var opacity = (0.5 + (this.index % 10) / 10).toFixed(1);
            var opacity = 0.3 + Math.random() * 0.7;
            this.div.css({
                position: "absolute",
                backgroundColor: "#000",
                opacity: opacity,
                width: this.w + "px",
                height: this.h + 'px',
                left: "100px",
                top: 100 + this.index * 10 + "px",
                borderRadius: "2px",
                marginLeft: -(this.min + this.step * this.index) / 2 + "px",
                borderBottom: "1px solid #ccc"
            });
            $(document.body).append(this.div);
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
        this.h = 100;
        this.w = 50;
        this.top = 200;
        this.left = 200;
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
            var div = document.createElement("div");
            var div2 = document.createElement("div");
            div = $(div);
            div2 = $(div2);
            div.css({
                borderLeft: "1px solid #aaa",
                height: this.h + "px",
                width: 0,
                position: "absolute",
                //left : this.left + this.index * this.h + this.h + "px",
                left: this.origin.x + "px",
                top: this.origin.y - this.h + "px"
            });
            div2.css({
                position: "absolute",
                width: this.w + "px",
                height: 0,
                borderBottom: "1px solid #aaa",
                bottom: 0,
                left: (- this.w / 2) + 'px'
            });
            div.append(div2);
            this.div = div;
            $(document.body).append(div);
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
                    top: this.origin.y - rect.h * index + "px",
                    left: this.origin.x + "px"
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
    var count = 0;//盘数/层数,不超10层

    // 记录是否已经开始播放
    var flag = false;

    // 点击按钮播放
    $('#start').on("click", function () {

        // 如果还在播放就退出方法
        if (flag) {
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




})();