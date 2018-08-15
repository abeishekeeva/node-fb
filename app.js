
const ajv = require('ajv');
const admin = require('firebase-admin');

function sendToFirebase(req, res) {

    var token = req.body.token;

    var message = {
            notification: {
                title: req.body.title,
                body: req.body.body,
                show_in_foreground: "true",
                priority: "high",
                sound: "default",
                icon: "ic_launcher"
            },

            data: {
                show_in_foreground: "true",
                custom_notification: JSON.stringify({
                    title: req.body.title,
                    body: req.body.body,
                    show_in_foreground: true,
                    priority: "high",
                    sound: "default",
                    icon: "ic_launcher",
                }),
            }
    };

    //валидация сообщения на необходимые параметры
    var validate = ajv.compile(messageSchema);
    var isValid = validate(message);

    if (isValid) {

        admin.messaging().sendToDevice(token, message)

            .then((response) => {

                if(response['successCount'] == 1) {

                    var resp = {"message" : "Сообщение доставлено", "messageId" : response.results[0].messageId};

                    //eventemitter для логгирования запроса
                    eventEmitter.emit(["send_push", "router"], "INFO", "Запрос выполнен - успешно", 'Запрос: ' + JSON.stringify(req.body) + '. Ответ: '+ JSON.stringify(resp));
                    resp = respUtils.buildSuccessResponse(resp); //buildErrorResponse возвращает JSON-объект с деталями о выполненном запросе.  также подключается библиотка respUtils для генерации одного формата ответов
                    res.send(resp);
                    return;

                } else if (fbResps.indexOf(response.results[0].error.code) != -1) {

                    var err = firebaseResponse.handleFirebaseResponse(response.results[0].error.code);

                    //eventemitter для логгирования ошибки
                    eventEmitter.emit(["send_push", "router"], "ERROR", "Ошибка при отправке запроса в Firebase. ", "Error: " + JSON.stringify(err) + '. Запрос: '+ JSON.stringify(req.body));
                    let errResp = respUtils.buildErrorResponse(err); //buildErrorResponse возвращает JSON-объект с деталями об ошибке. также подключается библиотка respUtils для генерации одного формата ошибок
                    res.send(errResp);
                    return;

                }
            })

            .catch((error) => {

                if (fbResps.indexOf(error.code) != -1) {
                    error = firebaseResponse.handleFirebaseResponse(error.code);
                }

                eventEmitter.emit(["send_push", "router"], "ERROR", "Ошибка при выполнении запроса. ", "Error: " +  JSON.stringify(error) + '. Запрос: ' + JSON.stringify(req.body));
                var err = respUtils.buildErrorResponse(error);
                res.send(err);
                return;

            });
    } else {

        var error = respUtils.buildErrorResponse({code: "Validation Error", message: "Отсутствуют необходимые параметы запроса"});
        eventEmitter.emit(["send_push", "router"], "ERROR", "Отсутствуют необходимые параметы запроса", {'data': req.body, 'error': error });
        res.json(error);
        return;

    }

}

 