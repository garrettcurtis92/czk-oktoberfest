import { NextResponse } from "next/server";
import { sendToAll } from "@/lib/push-server";

export async function POST(req: Request) {
	try {
		await sendToAll({ title: "Test Notification", body: "This is a test push from the server.", url: "/" });
		return NextResponse.json({ ok: true });
	} catch (err) {
		return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
	}
}
