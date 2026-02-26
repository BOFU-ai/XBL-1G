function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

 //ȡ��cookie
function getCookie(c_name)
{
    if (document.cookie.length>0)
    {
        c_start=document.cookie.indexOf(c_name + "=")

        if (c_start!=-1)
        {
            c_start=c_start + c_name.length+1
            c_end=document.cookie.indexOf(";",c_start)
            if (c_end==-1) c_end=document.cookie.length
            return unescape(document.cookie.substring(c_start,c_end))
        }
    }
    return ""
}

function setCookie(c_name,value,expiredays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays)
    document.cookie=c_name+ "=" +escape(value)+
        ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}

var serverUrl="https://event.hudongsd.com/fuyou";
var openid=getCookie('openid');
var niname="";
var icon="";
var username="";
if(openid==""){
    if(getQueryString("id")!=null){
        //window.location.replace("../index.php?eid="+getQueryString("id"));
    }else{
      //window.location.replace("../index.php");
    }
}
//console.log(openid,document.documentElement.clientWidth);
document.documentElement.style.fontSize = document.documentElement.clientWidth / 7.5 + 'px';