var isUsername = false;
var isPassword = false;
var globalPassword = '';

var isName = false;
var isBirth = false;
var isGender = false;

/**
 * Username 처리
 * @param event
 */
function usernameCheck(event){
    const username = event.target.value;
    const usernameResult = document.getElementById('account_username_result')
    if(checkUsernameRegex(username)){
        usernameResult.textContent = '';
        axios.get(`/account/api/username-dup?username=${username}`)
            .then(response => {
                if(response.data){
                    isUsername = true;
                    usernameResult.textContent = '';
                }else{
                    isUsername  = false;
                    usernameResult.style.color = '#ff0000';
                    usernameResult.textContent = '이미 등록된 아이디입니다.'
                }
            })
    }else{
        isUsername = false
        usernameResult.style.color = '#ff0000';
        usernameResult.textContent = '아이디를 다시 입력해주세요'
    }
}

function checkUsernameRegex(username){
    const regex = /^[a-zA-Z0-9]{5,}$/;
    return regex.test(username);
}

/**
 * Password 처리
 */
function passwordRegex(event){
    const regex = /^[A-Za-z0-9!@#$%^&*()_+={}\[\]|;:'",.<>?/-]{5,}$/;
    const result = document.getElementById('account_password_result');
    if(regex.test(event.target.value)){
        //성공했다면
        globalPassword = event.target.value;
        result.textContent = '';
    }else{
        isPassword = false;
        result.style.color = '#ff0000';
        result.textContent = '비밀번호를 다시 입력해주세요'
    }
}

function checkPassword(event){
    const confirmPassword = event.target.value;
    const result = document.getElementById('account_password_result');
    if(confirmPassword === globalPassword){
        //비밀번호가 서로 같다면
        result.textContent = '';
        isPassword = true;
    }else{
        isPassword = false;
        result.style.color = '#ff0000';
        result.textContent = '비밀번호가 서로 일치하지 않습니다'
    }
}

/**
 * name처리
 */
function nameCheck(event){
    const name = event.target.value;
    const result = document.getElementById('account_name_result')

    const regex = /^[가-힣]{2,}$/;

    if(regex.test(name)){
        isName = true;
        result.textContent = '';
    }else{
        isName = false;
        result.style.color = '#ff0000';
        result.textContent = '이름을 다시 입력해주세요';
    }
}

/**
 * 생년월일 처리
 */
function birthCheck(event){
    const birth = event.target.value;
    const result = document.getElementById('account_birth_result');
    const regex = /^\d{0,6}$/;
    if(regex.test(birth)){
        isBirth = true;
        result.textContent = '';
    }else{
       isBirth = false;
       result.style.color = '#ff0000';
       result.textContent = '생년월일을 다시 입력해주세요';
    }
}

/**
 * 성별처리
 */
function genderCheck(event){
    const gender = event.target.value;
    const result = document.getElementById('account_gender_result')
    if(gender !== 0){
        isGender = true;
        result.textContent = '';
    }else{
        isGender = false;
        result.style.color = '#ff0000';
        result.textContent = '성별을 선택해주세요';
    }
}
/**
 * 분반처리
 */
function campusCheck(event){
    const campus = event.target.value;
    axios.get(`/account/api/campus/list?campus=${campus}`)
        .then(response => {
            const classList = response.data;
            const classSelect = document.getElementById('account_select_class');
            classSelect.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = '선택';
            defaultOption.textContent = "선택"
            classSelect.appendChild(defaultOption)

            classList.forEach(item => {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = item.name;
                classSelect.appendChild(option)
            });
        }).catch(error => {
            console.error('Fetching error ', error);
    })
}

function checkClass(event){
    const selectedClass = event.target.value;
    isCampus = selectedClass !== "선택";
}

/**
 * 이메일 처리
 */
function emailCheck(event){
    const email = event.target.value;
    const result = document.getElementById('account_email_result')
    if(checkMailRegex(email)){
        result.textContent = '';
        axios.get(`/account/api/email-dup?email=${email}`)
            .then(response => {
                if(response.data){
                    sendEvent()
                }else{
                    isEmail = false
                    result.style.color = '#ff0000';
                    result.textContent = '이미 등록된 이메일입니다'
                }
            })
            .catch(error => {
                console.error(error);
            });
    }
    else{
        result.style.color = '#ff0000';
        result.textContent = "이메일 형식을 다시 확인해주세요"
    }
}