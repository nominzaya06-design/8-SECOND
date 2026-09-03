class ApiError extends Error {
    constructor(message, status = 500, data = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

export async function apiFetch(path, options = {}) {
    const request = {
        method: options.method || "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
            ...(options.headers || {})
        }
    };

    if (options.body !== undefined) {
        if (options.body instanceof FormData) {
            request.body = options.body;
        } else {
            request.headers["Content-Type"] = "application/json";
            request.body = JSON.stringify(options.body);
        }
    }

    const response = await fetch(path, request);
    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (!response.ok) {
        throw new ApiError(data?.message || `Request failed (${response.status}).`, response.status, data);
    }

    return data;
}
