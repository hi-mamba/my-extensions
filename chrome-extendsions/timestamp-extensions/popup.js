        class TimestampConverter {
            constructor() {
                this.timestampInput = document.getElementById('timestamp');
                this.convertBtn = document.getElementById('convertBtn');
                this.result = document.getElementById('result');
                this.currentTime = document.getElementById('currentTime');
                this.currentTimestamp = document.getElementById('currentTimestamp');
                
                this.init();
            }

            init() {
                this.convertBtn.addEventListener('click', () => this.convert());
                this.timestampInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.convert();
                    }
                });

                // 实时显示当前时间
                this.updateCurrentTime();
                setInterval(() => this.updateCurrentTime(), 1000);

                // 输入时实时转换
                this.timestampInput.addEventListener('input', () => {
                    if (this.timestampInput.value.trim()) {
                        this.convert();
                    }
                });
            }

            updateCurrentTime() {
                const now = new Date();
                const formatted = this.formatDate(now);
                const timestamp10 = Math.floor(now.getTime() / 1000);
                const timestamp13 = now.getTime();

                this.currentTime.textContent = formatted;
                this.currentTimestamp.innerHTML = `10位: ${timestamp10} | 13位: ${timestamp13}`;
            }

            getSelectedType() {
                const radios = document.getElementsByName('timestampType');
                for (let radio of radios) {
                    if (radio.checked) {
                        return radio.value;
                    }
                }
                return 'auto';
            }

            convert() {
                const input = this.timestampInput.value.trim();
                
                if (!input) {
                    this.showResult('请输入时间戳', 'error');
                    return;
                }

                // 检查是否为纯数字
                if (!/^\d+$/.test(input)) {
                    this.showResult('无效的时间戳格式，请输入纯数字', 'error');
                    return;
                }

                const timestamp = parseInt(input);
                const selectedType = this.getSelectedType();
                
                try {
                    let date;
                    let detectedType = '';

                    if (selectedType === 'auto') {
                        // 自动识别逻辑
                        if (input.length === 10) {
                            // 10位时间戳 (秒)
                            date = new Date(timestamp * 1000);
                            detectedType = '(检测为10位秒级时间戳)';
                        } else if (input.length === 13) {
                            // 13位时间戳 (毫秒)
                            date = new Date(timestamp);
                            detectedType = '(检测为13位毫秒级时间戳)';
                        } else {
                            // 尝试根据数值大小判断
                            if (timestamp < 10000000000) {
                                // 小于10位最大值，按秒处理
                                date = new Date(timestamp * 1000);
                                detectedType = '(按秒级时间戳处理)';
                            } else {
                                // 按毫秒处理
                                date = new Date(timestamp);
                                detectedType = '(按毫秒级时间戳处理)';
                            }
                        }
                    } else if (selectedType === '10') {
                        // 强制按10位处理
                        date = new Date(timestamp * 1000);
                        detectedType = '(10位秒级时间戳)';
                    } else if (selectedType === '13') {
                        // 强制按13位处理
                        date = new Date(timestamp);
                        detectedType = '(13位毫秒级时间戳)';
                    }

                    // 验证日期是否有效
                    if (isNaN(date.getTime())) {
                        this.showResult('无法识别的时间戳格式', 'error');
                        return;
                    }

                    // 检查日期是否在合理范围内 (1970-2100)
                    const year = date.getFullYear();
                    if (year < 1970 || year > 2100) {
                        this.showResult(`时间戳转换结果异常 (${year}年)，请检查输入格式`, 'error');
                        return;
                    }

                    const formatted = this.formatDate(date);
                    this.showResult(`${formatted} ${detectedType}`, 'success');

                } catch (error) {
                    this.showResult('转换失败，请检查时间戳格式', 'error');
                }
            }

            formatDate(date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }

            showResult(message, type = '') {
                this.result.textContent = message;
                this.result.className = `result ${type}`;
            }
        }

        // 初始化转换器
        document.addEventListener('DOMContentLoaded', () => {
            new TimestampConverter();
        });