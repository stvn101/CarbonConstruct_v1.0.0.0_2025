from starlette.applications import Starlette
from starlette.routing import Route

async def poc(request):
    async with request.form():
        pass

app = Starlette(routes=[
    Route('/', poc, methods=["POST"]),
])
