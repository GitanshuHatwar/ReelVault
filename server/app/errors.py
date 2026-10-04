from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    status, code = 400, "bad_request"

    def __init__(self, message: str = "", *, status: int | None = None, code: str | None = None):
        super().__init__(message)
        self.message = message
        if status:
            self.status = status
        if code:
            self.code = code


class InvalidURL(AppError):
    status, code = 422, "invalid_url"


class Unauthorized(AppError):
    status, code = 401, "unauthorized"


class NotFound(AppError):
    status, code = 404, "not_found"


class RateLimited(AppError):
    status, code = 429, "rate_limited"


class NoContent(AppError):
    status, code = 422, "no_content"


class UpstreamFailed(AppError):
    status, code = 502, "upstream_failed"


class AuthError(AppError):
    status, code = 400, "auth_error"


class PipelineError(Exception):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _handler(_: Request, e: AppError):
        return JSONResponse(status_code=e.status, content={"error": {"code": e.code, "message": e.message}})
