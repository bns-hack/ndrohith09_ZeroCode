from rest_framework.response import Response

ACTION = "ACTION"
RESPONSE = "RESPONSE"
STATUSCODE = "STATUSCODE"

def display_response(action , response , statuscode):
    return Response({
        ACTION: action, 
        RESPONSE: response, 
        STATUSCODE: statuscode})

SUCCESS = "ACTION PERFORMED SUCCESSFULLY"

def exceptiontype(exception):
    return "Type:{}".format(type(exception.__name__))

def exceptionmsg(exception):
    return "Msg:{}".format(type(exception))