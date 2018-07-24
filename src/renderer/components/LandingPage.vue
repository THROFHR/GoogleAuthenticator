<template>
  <div id="wrapper">
    <div class="box">
      <el-input class="search" placeholder="通过名字搜索" suffix-icon="el-icon-search" v-model="name"></el-input>
      <el-button type="primary" icon="el-icon-plus" @click="dialogVisible = true"></el-button>
    </div>
    <div class="box-warp">
        <div v-for="item in filterList()" style="margin:20px;" :key="item.secret">
          <el-card class="box-card" :body-style="{padding: '0px'}">
            <div class="header">
              <span>{{item.name}}</span>
              <span class="delete" @click="delAccount(item)"><i class="el-icon-delete"></i></span>
            </div>
            <el-progress :stroke-width="5" :percentage="percentage" status="success" :show-text="false"></el-progress>
            <div class="code">
              {{item.token}}
              <span>{{item.secret}}</span>
            </div>
          </el-card>
        </div>
    </div>
    <el-dialog title="添加Google Authenticator" :visible.sync="dialogVisible">
      <el-form :model="newGA">
        <el-form-item label="账号名称">
          <el-input v-model="newGA.name" placeholder="建议填写 网站名称+邮箱！如：google登录+xxx@gmail.com"></el-input>
        </el-form-item>
        <el-form-item label="账号密钥">
          <el-input v-model="newGA.secret" placeholder="只需填写密钥部分，格式:PZD7V****DYNMLIY"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="newAccount">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  const speakeasy = require('speakeasy');

  export default {
    name: 'landing-page',
    data() {
      return {
        name: '',
        percentage: 100,
        list: [],
        dialogVisible: false,
        newGA: {
          name: '',
          secret: '',
        },
      };
    },
    methods: {
      async getList() {
        const list = await this.$db.find({});
        this.list = list;
        this.refreshList();
      },
      open(link) {
        this.$electron.shell.openExternal(link);
      },
      getToken(secret) {
        const token = speakeasy.totp({
          secret,
          encoding: 'base32',
        });
        return token;
      },
      filterList() {
        const reg = new RegExp(this.name, 'i');
        return this.list.filter(item => reg.test(item.name));
      },
      refreshList() {
        this.list = this.list.map((item) => {
          item.token = this.getToken(item.secret);
          return item;
        });
      },
      newAccount() {
        const ga = this.newGA;
        if (!ga.name) {
          this.$notify.error({
            title: '写个名字，不然下次怎么找？',
          });
          return;
        }
        try {
          const token = this.getToken(ga.secret);
          if (!ga.secret || !token) {
            throw new Error('请确认密钥是否正确');
          }
          this.$db.insert(ga).then(() => {
            this.getList();
            this.dialogVisible = false;
          });
        } catch (e) {
          this.$notify.error({
            title: '密钥解码出错',
            message: e.message || '',
          });
        }
      },
      delAccount(item) {
        this.$alert('删除该账户并不会停用二步验证，请确保你知道你在干什么...', `删除 ${item.name}？`, {
          confirmButtonText: '确定',
          callback: (action) => {
            if (action === 'cancel') {
              this.$message({
                type: 'info',
                message: '取消删除',
              });
            } else if (action === 'confirm') {
              this.$db.remove({ secret: item.secret }).then(() => {
                this.getList();
                this.$message({
                  type: 'success',
                  message: '删除成功',
                });
              });
            }
          },
        });
      },
    },
    created() {
      this.getList();
      setInterval(() => {
        const s = new Date().getSeconds();
        const r = s % 30;
        if (r === 0) {
          this.percentage = 100;
          this.refreshList();
        } else {
          this.percentage = (100 - (3.3 * r));
        }
      }, 1000);
    },
  };
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  .box{
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .search{
    margin-right: 20px;
  }
  .box-warp{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
  .box-card{
    min-width: 200px;
  }
  .box-warp .header{
    padding: 10px;
    display: flex;
    justify-content: space-between;
    color: #606266;
  }
  .delete{
    cursor: pointer;
    color: #C0C4CC;
  }
  .code{
    padding: 10px;
    text-align: center;
    font-size: 36px;
    color: #409EFF;
  }
  .code span{
    color: #C0C4CC;
    font-size: 12px;
  }
</style>
